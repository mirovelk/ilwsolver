import { lusolve } from "mathjs";

import {
  add,
  Complex,
  complex,
  copy,
  minus,
  multiply,
  subtract,
} from "../../util/complex";

const E1 = complex(2);
const E2 = complex(3);
const E3 = complex(-5);

const AL: Complex[] = [complex(6), complex(5)]; // length N
const AR: Complex[] = [complex(3), complex(2)]; // length N

// input vector M, output vector M
export function eqns(input: Complex[], q: Complex): Complex[] {
  let result: Complex[] = [];
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

    result = [...result, subtract(tmp1, tmp2)]; // TODO do not create new array
  }

  return result;
}

// input vector M, output matrix MxM
export function eqnsd(input: Complex[], q: Complex): Complex[][] {
  // empty matrix M*M
  let result: Complex[][] = new Array(input.length)
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

export function transpose(matrix: any[][]) {
  return matrix[0].map((_col, i) => matrix.map((row) => row[i]));
}

export type ResultInQ = Complex[]; // length = M
export type ResultInQArray = ResultInQ[];

// xSeed.length === M
export function solveInQ(xSeed: Complex[], q: Complex): ResultInQ {
  let tmp = xSeed.map((xSeed) => copy(xSeed));

  // count iterations
  for (let i = 0; i < 20; i++) {
    const A = matrixComplexToReal(eqnsd(tmp, q));
    const b = vectorComplexToReal(eqns(tmp, q));

    const solvedRealX = lusolve(A, b) as number[];
    const x = vectorRealToComplex(solvedRealX);

    tmp = subtractComplexVectors(tmp, x);
  }

  return tmp;
}

export function solveInQArray(
  xSeed: Complex[],
  qArray: Complex[]
): ResultInQArray {
  const output: Complex[][] = [];

  output.push(xSeed); // initial value = xSeed

  for (let i = 0; i < qArray.length; i++) {
    output.push(solveInQ(output[output.length - 1], qArray[i]));
  }

  return transpose(output.slice(1));
}
