import {
  add,
  Complex,
  complex,
  copy,
  divide,
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

    result = [...result, subtract(tmp1, tmp2)];
  }

  return result;
}

// input vector M, output matrix MxM
export function eqnsd(input: Complex[], q: Complex): Complex[][] {
  let tmp = complex(0);
  for (let j = 0; j < AL.length; j++) {
    let tmp1 = copy(q);
    let tmp2 = complex(1);

    for (let i = 0; i < AL.length; i++) {
      if (i !== j) {
        tmp1 = multiply(tmp1, subtract(input[0], AL[i]));
        tmp2 = multiply(tmp2, subtract(input[0], AR[i]));
      }
    }
    tmp = subtract(add(tmp, tmp1), tmp2);
  }

  return [[tmp]];
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
