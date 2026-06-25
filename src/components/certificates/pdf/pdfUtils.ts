import type jsPDF from "jspdf";
import { NOTO_DEVANAGARI_REGULAR, NOTO_DEVANAGARI_BOLD } from "./fonts/NotoDevanagari";

export type CertificateLang = "en" | "mr";

const registeredDocs = new WeakSet<object>();

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
