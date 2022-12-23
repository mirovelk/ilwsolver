import { Complex, stringifyComplex } from './complex';

export function stringifyComplexArrayForMathematica(input: Complex[]) {
  let output = '';
  output += '{';
  input.forEach((c, cIndex) => {
    output += stringifyComplex(c, true);
    if (cIndex < input.length - 1) output += ',';
  });
  output += '}';

  return output;
}

export function stringifyArrayOfComplexArraysForMathematica(
  input: Complex[][]
) {
  let output = '';
  output += '{';
  input.forEach((row, rowIndex) => {
    output += stringifyComplexArrayForMathematica(row);
    if (rowIndex < input.length - 1) output += ',';
  });
  output += '}';

  return output;
}
