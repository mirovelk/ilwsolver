import { Color } from "paper";

export const initialColor = new Color(0, 1, 0);

export const colorCount = 15;

export const hueShift = 360 / colorCount;

export function getColorForIndex(i: number): paper.Color {
  const color = new Color(initialColor);
  color.hue += (i * hueShift) % 360;
  return color;
}
