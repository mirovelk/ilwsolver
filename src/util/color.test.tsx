import { getColorForIndex, initialColor } from "./color";

test("returns initial color for i===0", () => {
  expect(getColorForIndex(0).hue).toEqual(initialColor.hue);
});

test("returns shifted color hue for i===1", () => {
  expect(getColorForIndex(1).hue).toEqual(initialColor.hue + 72);
});

test("returns first color hue for i===5", () => {
  expect(getColorForIndex(5).hue).toEqual(initialColor.hue);
});
