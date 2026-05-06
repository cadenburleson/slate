const MEDIA_BASE = process.env.EXPO_PUBLIC_MEDIA_BASE_URL ?? "";

const WIDTH_TO_PX = {
  small: 400,
  medium: 800,
  large: 1600,
  full: 1600,
} as const;

const VARIANTS = [400, 800, 1600] as const;

export type MediaWidth = keyof typeof WIDTH_TO_PX;

export function srcFor(value: string | null | undefined, width: MediaWidth = "full"): string {
  if (!value) return "";
  if (!value.startsWith("r2:")) return value;
  const stem = value.slice(3);
  return `${MEDIA_BASE}/${stem}-${WIDTH_TO_PX[width]}.webp`;
}

// Build a srcset across all 3 resolution variants. Returns "" for non-r2:
// passthrough URLs (we don't know which variants exist for arbitrary src).
export function srcSetFor(value: string | null | undefined): string {
  if (!value || !value.startsWith("r2:")) return "";
  const stem = value.slice(3);
  return VARIANTS.map((px) => `${MEDIA_BASE}/${stem}-${px}.webp ${px}w`).join(", ");
}
