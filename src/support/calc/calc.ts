import { lusolve } from 'mathjs';

import {
  abs,
  add,
  Complex,
  complex,
  copy,
  minus,
  multiply,
  subtract,
} from '../../util/complex';

export interface Ex {
  E1: Complex;
  E2: Complex;
  E3: Complex;
}

export interface Ax {
  AL: Complex[];
  AR: Complex[];
}

export interface CalcConfig {
  Ex: Ex;
  Ax: Ax;
}

// input vector M, output vector M
export function eqns(
  input: Complex[],
  q: Complex,
  config: CalcConfig
): Complex[] {
  const { E1, E2, E3 } = config.Ex;
  const { AL, AR } = config.Ax;

  const result: Complex[] = [];
  for (let i = 0; i < input.length; i++) {
    let tmp1 = copy(q);
    let tmp2 = complex(1);

    for (let j = 0; j < AL.length; j++) {
      tmp1 = multiply(tmp1, subtract(input[i], AL[j]));
      tmp2 = multiply(tmp2, subtract(input[i], AR[j]));
    }

    for (let j = 0; j < input.length; j++) {
      if (j !== i) {
        tmp1 = multiply(tmp1, add(subtract(input[i], input[j]), E1));
        tmp2 = multiply(tmp2, subtract(subtract(input[i], input[j]), E1));

        tmp1 = multiply(tmp1, add(subtract(input[i], input[j]), E2));
        tmp2 = multiply(tmp2, subtract(subtract(input[i], input[j]), E2));

        tmp1 = multiply(tmp1, add(subtract(input[i], input[j]), E3));
        tmp2 = multiply(tmp2, subtract(subtract(input[i], input[j]), E3));
      }
    }

    result.push(subtract(tmp1, tmp2));
  }

  return result;
}

// input vector M, output matrix MxM
export function eqnsd(
  input: Complex[],
  q: Complex,
  config: CalcConfig
): Complex[][] {
  const { E1, E2, E3 } = config.Ex;
  const { AL, AR } = config.Ax;

  // empty matrix M*M
  const result: Complex[][] = new Array(input.length)
    .fill(undefined)
    .map(() => new Array(input.length).fill(undefined));

  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < input.length; j++) {
      if (i !== j) {
        let tmp1 = minus(q);
        let tmp2 = complex(-1);
        for (let k = 0; k < AL.length; k++) {
          tmp1 = multiply(tmp1, subtract(input[i], AL[k]));
          tmp2 = multiply(tmp2, subtract(input[i], AR[k]));
        }

        for (let k = 0; k < input.length; k++) {
          if (k !== i && k !== j) {
            tmp1 = multiply(tmp1, add(subtract(input[i], input[k]), E1));
            tmp2 = multiply(tmp2, subtract(subtract(input[i], input[k]), E1));

            tmp1 = multiply(tmp1, add(subtract(input[i], input[k]), E2));
            tmp2 = multiply(tmp2, subtract(subtract(input[i], input[k]), E2));

            tmp1 = multiply(tmp1, add(subtract(input[i], input[k]), E3));
            tmp2 = multiply(tmp2, subtract(subtract(input[i], input[k]), E3));
          }
        }

        tmp1 = multiply(
          tmp1,
          add(
            add(
              multiply(
                add(subtract(input[i], input[j]), E1),
                add(subtract(input[i], input[j]), E2)
              ),
              multiply(
                add(subtract(input[i], input[j]), E1),
                add(subtract(input[i], input[j]), E3)
              )
            ),
            multiply(
              add(subtract(input[i], input[j]), E2),
              add(subtract(input[i], input[j]), E3)
            )
          )
        );

        tmp2 = multiply(
          tmp2,
          add(
            add(
              multiply(
                subtract(subtract(input[i], input[j]), E1),
                subtract(subtract(input[i], input[j]), E2)
              ),
              multiply(
                subtract(subtract(input[i], input[j]), E1),
                subtract(subtract(input[i], input[j]), E3)
              )
            ),
            multiply(
              subtract(subtract(input[i], input[j]), E2),
              subtract(subtract(input[i], input[j]), E3)
            )
          )
        );
        result[i][j] = subtract(tmp1, tmp2);
      } else {
        result[i][i] = complex(0);

        for (let k = 0; k < AL.length; k++) {
          let tmp1 = copy(q);
          let tmp2 = complex(1);

          for (let l = 0; l < AL.length; l++) {
            if (l !== k) {
              tmp1 = multiply(tmp1, subtract(input[i], AL[l]));
              tmp2 = multiply(tmp2, subtract(input[i], AR[l]));
            }
          }

          for (let l = 0; l < input.length; l++) {
            if (l !== i) {
              tmp1 = multiply(tmp1, add(subtract(input[i], input[l]), E1));
              tmp2 = multiply(tmp2, subtract(subtract(input[i], input[l]), E1));

              tmp1 = multiply(tmp1, add(subtract(input[i], input[l]), E2));
              tmp2 = multiply(tmp2, subtract(subtract(input[i], input[l]), E2));

              tmp1 = multiply(tmp1, add(subtract(input[i], input[l]), E3));
              tmp2 = multiply(tmp2, subtract(subtract(input[i], input[l]), E3));
            }
          }
          result[i][i] = add(subtract(tmp1, tmp2), result[i][i]);
        }

        for (let k = 0; k < input.length; k++) {
          if (k !== i) {
            let tmp1 = copy(q);
            let tmp2 = complex(1);

            for (let l = 0; l < AL.length; l++) {
              tmp1 = multiply(tmp1, subtract(input[i], AL[l]));
              tmp2 = multiply(tmp2, subtract(input[i], AR[l]));
            }

            for (let l = 0; l < input.length; l++) {
              if (l !== i && l !== k) {
                tmp1 = multiply(tmp1, add(subtract(input[i], input[l]), E1));
                tmp2 = multiply(
                  tmp2,
                  subtract(subtract(input[i], input[l]), E1)
                );

                tmp1 = multiply(tmp1, add(subtract(input[i], input[l]), E2));
                tmp2 = multiply(
                  tmp2,
                  subtract(subtract(input[i], input[l]), E2)
                );

                tmp1 = multiply(tmp1, add(subtract(input[i], input[l]), E3));
                tmp2 = multiply(
                  tmp2,
                  subtract(subtract(input[i], input[l]), E3)
                );
              }
            }

            tmp1 = multiply(
              tmp1,
              add(
                add(
                  multiply(
                    add(subtract(input[i], input[k]), E1),
                    add(subtract(input[i], input[k]), E2)
                  ),
                  multiply(
                    add(subtract(input[i], input[k]), E1),
                    add(subtract(input[i], input[k]), E3)
                  )
                ),
                multiply(
                  add(subtract(input[i], input[k]), E2),
                  add(subtract(input[i], input[k]), E3)
                )
              )
            );

            tmp2 = multiply(
              tmp2,
              add(
                add(
                  multiply(
                    subtract(subtract(input[i], input[k]), E1),
                    subtract(subtract(input[i], input[k]), E2)
                  ),
                  multiply(
                    subtract(subtract(input[i], input[k]), E1),
                    subtract(subtract(input[i], input[k]), E3)
                  )
                ),
                multiply(
                  subtract(subtract(input[i], input[k]), E2),
                  subtract(subtract(input[i], input[k]), E3)
                )
              )
            );
            result[i][i] = add(subtract(tmp1, tmp2), result[i][i]);
          }
        }
      }
    }
  }

  return result;
}

export function matrixComplexToReal(matrix: Complex[][]): number[][] {
  return [
    ...matrix.map((row) => [...row.map((c) => c[0]), ...row.map((c) => -c[1])]),
    ...matrix.map((row) => [...row.map((c) => c[1]), ...row.map((c) => c[0])]),
  ];
}

export function vectorComplexToReal(vector: Complex[]): number[] {
  return [...vector.map((c) => c[0]), ...vector.map((c) => c[1])];
}

export function vectorRealToComplex(vector: number[]): Complex[] {
  const firstHalf = vector.slice(0, vector.length / 2);
  const secondHalf = vector.slice(vector.length / 2, vector.length);
  return firstHalf.map((r, index) => complex(r, secondHalf[index]));
}

export function subtractComplexVectors(a: Complex[], b: Complex[]): Complex[] {
  return a.map((ai, i) => subtract(ai, b[i]));
}

export function transpose<T>(matrix: T[][]) {
  return matrix[0].map((_col, i) => matrix.map((row) => row[i]));
}

export type ResultInQ = Complex[]; // length = M
export type ResultsInQArray = Complex[][];

function complexVectorAbsSum(vector: Complex[]): number {
  return vector.reduce((acc, c) => acc + abs(c), 0);
}

const precision = 1e-10;

// xSeed.length === M
export function solveInQ(
  xSeed: Complex[],
  q: Complex,
  config: CalcConfig
): ResultInQ {
  let tmp = xSeed.map((c) => copy(c));
  let tmpAbsSum = complexVectorAbsSum(tmp);

  // count iterations

  for (let i = 0; i < 20; i++) {
    const A = matrixComplexToReal(eqnsd(tmp, q, config));
    const b = vectorComplexToReal(eqns(tmp, q, config));

    const solvedRealX = lusolve(A, b) as number[];
    const x = vectorRealToComplex(solvedRealX);

    tmp = subtractComplexVectors(tmp, x);

    const newTmpAbsSum = complexVectorAbsSum(tmp);

    if (Math.abs(newTmpAbsSum - tmpAbsSum) < precision) {
      break;
    }

    tmpAbsSum = newTmpAbsSum;
  }

  return tmp;
}

export function solveInQArray(
  xSeed: Complex[],
  qArray: Complex[],
  config: CalcConfig
): ResultsInQArray {
  const output: ResultsInQArray = [];

  output.push(xSeed); // initial value = xSeed

  for (let i = 0; i < qArray.length; i++) {
    output.push(solveInQ(output[output.length - 1], qArray[i], config));
  }

  return transpose(output.slice(1));
}
