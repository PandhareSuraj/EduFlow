import type jsPDF from "jspdf";
import { NOTO_DEVANAGARI_REGULAR, NOTO_DEVANAGARI_BOLD } from "./fonts/NotoDevanagari";

export type CertificateLang = "en" | "mr";

const registeredDocs = new WeakSet<object>();
const canvasTextDocs = new WeakSet<object>();
const MARATHI_CANVAS_FONT = "EduFlowNotoDevanagari";
const PT_TO_MM = 25.4 / 72;
let marathiCanvasFonts: Promise<void> | null = null;

function loadMarathiCanvasFonts(): Promise<void> {
  if (marathiCanvasFonts) return marathiCanvasFonts;

  marathiCanvasFonts = (async () => {
    if (typeof document === "undefined" || typeof FontFace === "undefined") return;

    try {
      const regular = new FontFace(
        MARATHI_CANVAS_FONT,
        `url(data:font/ttf;base64,${NOTO_DEVANAGARI_REGULAR})`,
        { weight: "400", style: "normal" }
      );
      const bold = new FontFace(
        MARATHI_CANVAS_FONT,
        `url(data:font/ttf;base64,${NOTO_DEVANAGARI_BOLD})`,
        { weight: "700", style: "normal" }
      );
      const loaded = await Promise.all([regular.load(), bold.load()]);
      loaded.forEach((font) => document.fonts.add(font));
    } catch {
      // Browser-installed Devanagari fonts remain as a shaping fallback.
    }
  })();

  return marathiCanvasFonts;
}

function isDevanagariFont(doc: jsPDF): boolean {
  const font = doc.getFont();
  return font.fontName === "NotoDevanagari";
}

function canvasFont(doc: jsPDF, scale: number): string {
  const weight = doc.getFont().fontStyle === "bold" ? 700 : 400;
  return `${weight} ${doc.getFontSize() * scale}px "${MARATHI_CANVAS_FONT}", "Nirmala UI", Mangal, sans-serif`;
}

function measureShapedText(doc: jsPDF, text: string, scale: number) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.font = canvasFont(doc, scale);
  return context.measureText(text);
}

/**
 * jsPDF embeds Devanagari glyphs but does not apply full Indic shaping. For
 * Marathi PDFs, render each text run through the browser canvas (HarfBuzz/
 * platform shaping) and place the shaped result back into the PDF.
 */
export async function prepareMarathiPdf(doc: jsPDF, lang: CertificateLang): Promise<void> {
  if (lang !== "mr" || canvasTextDocs.has(doc as unknown as object)) return;
  await loadMarathiCanvasFonts();

  const target = doc as unknown as {
    text: (...args: any[]) => jsPDF;
    getTextWidth: (text: string) => number;
  };
  const originalText = target.text.bind(doc);
  const originalGetTextWidth = target.getTextWidth.bind(doc);
  const scale = 4;

  target.getTextWidth = (text: string) => {
    if (!isDevanagariFont(doc) || typeof document === "undefined") {
      return originalGetTextWidth(text);
    }
    const metrics = measureShapedText(doc, String(text), scale);
    return metrics ? (metrics.width / scale) * PT_TO_MM : originalGetTextWidth(text);
  };

  target.text = (text: string | string[], x: number, y: number, options?: any, ...rest: any[]) => {
    if (!isDevanagariFont(doc) || typeof document === "undefined") {
      return originalText(text, x, y, options, ...rest);
    }

    const lines = Array.isArray(text) ? text.map(String) : String(text).split("\n");
    const fontSize = doc.getFontSize();
    const lineHeightFactor = options?.lineHeightFactor ?? doc.getLineHeightFactor();
    const lineHeight = fontSize * lineHeightFactor * PT_TO_MM;

    lines.forEach((line, index) => {
      if (!line) return;
      const metrics = measureShapedText(doc, line, scale);
      if (!metrics) {
        originalText(line, x, y + index * lineHeight, options, ...rest);
        return;
      }

      const padding = scale * 2;
      const ascent = metrics.actualBoundingBoxAscent || fontSize * scale * 0.85;
      const descent = metrics.actualBoundingBoxDescent || fontSize * scale * 0.25;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.ceil(metrics.width + padding * 2));
      canvas.height = Math.max(1, Math.ceil(ascent + descent + padding * 2));
      const context = canvas.getContext("2d");
      if (!context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = canvasFont(doc, scale);
      context.fillStyle = doc.getTextColor();
      context.textBaseline = "alphabetic";
      context.fillText(line, padding, padding + ascent);

      const textWidth = (metrics.width / scale) * PT_TO_MM;
      const paddingWidth = (padding / scale) * PT_TO_MM;
      const imageWidth = (canvas.width / scale) * PT_TO_MM;
      const imageHeight = (canvas.height / scale) * PT_TO_MM;
      const baselineY = y + index * lineHeight;
      let imageX = x - paddingWidth;
      if (options?.align === "center") imageX = x - textWidth / 2 - paddingWidth;
      if (options?.align === "right") imageX = x - textWidth - paddingWidth;
      const imageY = baselineY - ((padding + ascent) / scale) * PT_TO_MM;

      doc.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        undefined,
        "FAST"
      );
    });

    return doc;
  };

  canvasTextDocs.add(doc as unknown as object);
}

/**
 * Registers the Noto Sans Devanagari font into a jsPDF document (once per doc).
 */
export function registerDevanagari(doc: jsPDF): void {
  if (registeredDocs.has(doc as unknown as object)) return;
  doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", NOTO_DEVANAGARI_REGULAR);
  doc.addFont("NotoSansDevanagari-Regular.ttf", "NotoDevanagari", "normal");
  doc.addFileToVFS("NotoSansDevanagari-Bold.ttf", NOTO_DEVANAGARI_BOLD);
  doc.addFont("NotoSansDevanagari-Bold.ttf", "NotoDevanagari", "bold");
  registeredDocs.add(doc as unknown as object);
}

/**
 * Sets the font on the doc based on language: Helvetica for English,
 * Noto Sans Devanagari for Marathi. Use this instead of doc.setFont.
 */
export function setLangFont(
  doc: jsPDF,
  lang: CertificateLang,
  style: "normal" | "bold" | "italic" = "normal"
): void {
  if (lang === "mr") {
    registerDevanagari(doc);
    // Devanagari font has no italic; map italic -> normal
    doc.setFont("NotoDevanagari", style === "bold" ? "bold" : "normal");
  } else {
    doc.setFont("helvetica", style);
  }
}

export interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

export function buildCertificateFileName(
  studentName: string | null | undefined,
  certificateName: string,
  lang: CertificateLang
): string {
  const safe = (value: string) =>
    value
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "")
      .replace(/\s+/g, "_");
  const name = safe(studentName || "student") || "student";
  const certificate = safe(certificateName) || "certificate";
  const language = lang === "mr" ? "Marathi" : "English";

  return `${name}_${certificate}_${language}.pdf`;
}

/**
 * Loads an image URL and converts it to a PNG data URL using a canvas.
 * Returns null on any failure so PDF generation never breaks.
 */
export async function loadImageAsDataUrl(url?: string | null): Promise<LoadedImage | null> {
  if (!url) return null;
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const loaded = await new Promise<HTMLImageElement | null>((resolve) => {
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
    if (!loaded) return null;
    const canvas = document.createElement("canvas");
    canvas.width = loaded.naturalWidth || loaded.width;
    canvas.height = loaded.naturalHeight || loaded.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(loaded, 0, 0);
    return {
      dataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    };
  } catch {
    return null;
  }
}
