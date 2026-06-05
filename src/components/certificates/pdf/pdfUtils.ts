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
