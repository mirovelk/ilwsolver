import { Color } from 'paper';

export const initialColor = new Color(0, 1, 0);

export const colorCount = 8;

export const hueShiftStep = 360 / colorCount;

export function getColorForIndex(i: number): paper.Color {
  const color = new Color(initialColor);

  // base shift
  color.hue += (i * hueShiftStep) % 360;

  // additional shift based on how many rotations there were
  // TODO can casue repeating colors!!!
  const rotation = Math.floor((i * hueShiftStep) / 360);
  if (rotation > 0) {
    color.hue += hueShiftStep / (rotation + 1);
  }
  return color;
}
