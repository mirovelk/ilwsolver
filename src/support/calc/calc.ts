import {
  add,
  Complex,
  complex,
  copy,
  divide,
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

// xSeed.length === M
export function calc(xSeeds: Complex[], q: Complex) {
  let tmp = xSeeds.map((xSeed) => copy(xSeed));

  // count iterations
  for (let i = 0; i < 20; i++) {
    tmp[0] = subtract(tmp[0], divide(eqns(tmp, q)[0], eqnsd(tmp, q)[0][0]));
  }

  return tmp;
}
