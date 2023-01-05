import chroma from 'chroma-js';

export const initialColor = chroma('hsl(210, 100%, 50%)');

export const colorCount = 8;

export const hueShiftStep = 360 / colorCount;

export function getDifferentColor(previousColors: string[]): string {
  if (previousColors.length === 0) {
    return initialColor.hex();
  }
  const buffer = previousColors.map((color) => chroma(color));

  const processedPreviousColors = buffer
    .map((previousColor) => ({
      original: previousColor, // save original
      hue: previousColor.get('hsl.h'), // extract hue
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

  const furthestColor = chroma(initialColor).set('hsl.h', furthestHue % 360);

  return furthestColor.hex();
}

export function getNextColorWithBuffer(buffer: string[]): string {
  const nextColor = getDifferentColor(buffer);
  buffer.push(nextColor);
  return nextColor;
}
