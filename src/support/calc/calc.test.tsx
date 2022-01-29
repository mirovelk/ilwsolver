import { calc, Complex, eqns, eqnsd } from "./calc";

test("eqns returns correct value", () => {
  expect(eqns([new Complex(0.5, 0.25)], new Complex(0.5, 0.25))).toEqual([
    new Complex(9.28125, 5.921875),
  ]);
});

test("eqnsd returns correct value", () => {
  expect(eqnsd([new Complex(0.5, 0.25)], new Complex(0.5, 0.25))).toEqual([
    [new Complex(-1.125, -2.75)],
  ]);
});

test("calc returns correct value", () => {
  expect(calc([new Complex(0.5, 0.25)], new Complex(0.5, 0.25))).toEqual([
    new Complex(3.804535746476545, 0.15110607406879045),
  ]);
});
