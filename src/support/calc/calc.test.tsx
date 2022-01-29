import { calc, eqns, eqnsd } from "./calc";

test("eqns returns correct value", () => {
  expect(eqns([[0.5, 0.25]], [0.5, 0.25])).toEqual([[9.28125, 5.921875]]);
});

test("eqnsd returns correct value", () => {
  expect(eqnsd([[0.5, 0.25]], [0.5, 0.25])).toEqual([[[-1.125, -2.75]]]);
});

test("calc returns correct value", () => {
  expect(calc([[0.5, 0.25]], [0.5, 0.25])).toEqual([
    [3.804535746476545, 0.15110607406879045],
  ]);
});
