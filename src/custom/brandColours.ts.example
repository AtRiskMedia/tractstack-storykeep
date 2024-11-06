export const brandColors = {
  'brand-1': '#10120d',
  'brand-2': '#fcfcfc',
  'brand-3': '#f58333',
  'brand-4': '#c8df8c',
  'brand-5': '#293f58',
  'brand-6': '#a7b1b7',
  'brand-7': '#393d34',
  'brand-8': '#e3e3e3',
} as const;

type BrandColorKey = keyof typeof brandColors;

export function getBrandColor(colorVar: string): string | null {
  const colorName = colorVar.replace('var(--', '').replace(')', '');
  return colorName in brandColors
    ? brandColors[colorName as BrandColorKey]
    : null;
}
