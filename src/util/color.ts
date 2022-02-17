import { Color } from 'paper';

export const initialColor = new Color({
  hue: 210,
  saturation: 1,
  lightness: 0.5,
});

export const colorCount = 8;

export const hueShiftStep = 360 / colorCount;

export function getDifferentColor(previousColors: paper.Color[]): paper.Color {
  if (previousColors.length === 0) {
    return initialColor;
  }
  const processedPreviousColors = previousColors
    .map((previousColor) => ({
      original: previousColor, // save original
      hue: previousColor.hue, // extract hue
    }))
    .sort((a, b) => a.hue - b.hue) // sort by hue
    .map((color, colorIndex, colorArray) => ({
      ...color,
      hueDistanceToRight:
        colorIndex + 1 < colorArray.length
          ? colorArray[colorIndex + 1].hue - color.hue
          : 360 - color.hue + colorArray[0].hue,
    }))
    .sort((a, b) => b.hueDistanceToRight - a.hueDistanceToRight);

  const furthestHue =
    processedPreviousColors[0].hue +
    Math.floor(processedPreviousColors[0].hueDistanceToRight / 2);

  const furthestColor = new Color(initialColor);
  furthestColor.hue = furthestHue % 360;

  return furthestColor;
}

export function getNextColorWithBuffer(buffer: paper.Color[]): paper.Color {
  const nextColor = getDifferentColor(buffer);
  buffer.push(nextColor);
  return nextColor;
}
