import type { ProductImage } from "@/types";

const SWATCH_COLORS: Record<string, string> = {
  Preto: "#1A1A1A",
  Branco: "#F4F1EA",
  Bege: "#C8B6A2",
  Rosa: "#D4A5A5",
  Azul: "#1E3A5F",
  Verde: "#2D5016",
  Cinza: "#8C8C8C",
  Nude: "#E3BC9A",
  Vermelho: "#7A1E2C",
  Marrom: "#6B4C3B",
};

export function getSwatchHex(colorName: string): string {
  const normalized = colorName.trim();
  const exact = SWATCH_COLORS[normalized];

  if (exact) {
    return exact;
  }

  const match = Object.entries(SWATCH_COLORS).find(
    ([key]) => key.toLowerCase() === normalized.toLowerCase(),
  );

  if (match) {
    return match[1];
  }

  let hash = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    hash = normalized.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 35%, 45%)`;
}

export function isLightSwatch(color: string): boolean {
  const normalized = color.trim().toLowerCase();

  return (
    normalized === "branco" ||
    normalized === "bege" ||
    normalized === "nude" ||
    normalized.startsWith("#f") ||
    normalized.startsWith("#e")
  );
}

export function extractProductColors(images?: ProductImage[]): string[] {
  if (!images?.length) {
    return [];
  }

  const seen = new Set<string>();
  const colors: string[] = [];

  for (const image of images) {
    if (!image.color || seen.has(image.color)) {
      continue;
    }

    seen.add(image.color);
    colors.push(image.color);
  }

  return colors;
}
