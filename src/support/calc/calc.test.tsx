import { calc, eqns, eqnsd } from "./calc";

test("eqns returns correct value", () => {
  expect(eqns([[0.5, 0.25]], [0.5, 0.25])).toEqual([[9.28125, 5.921875]]);
});

test("eqns returns correct value for M=3", () => {
  expect(
    eqns(
      [
        [0.5, 0.2],
        [0.4, 0.3],
        [0.3, 0.4],
      ],
      [0.5, 0.25]
    )
  ).toEqual([
    [11905.258487440005, 3175.397525280002],
    [8532.47024318, 5601.463081760001],
    [5322.1174444, 8279.692435200002],
  ]);
});

test("eqnsd returns correct value for M=1", () => {
  expect(eqnsd([[0.5, 0.25]], [0.5, 0.25])).toEqual([[[-1.125, -2.75]]]);
});

test("calc returns correct value", () => {
  expect(calc([[0.5, 0.25]], [0.5, 0.25])).toEqual([
    [3.804535746476545, 0.15110607406879045],
  ]);
});
