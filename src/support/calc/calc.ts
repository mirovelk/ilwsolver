export class Complex {
  public r: number;
  public i: number;

  constructor(_r: number, _i: number = 0) {
    this.r = _r;
    this.i = _i;
  }
}

function copy(c: Complex) {
  return new Complex(c.r, c.i);
}

export function add(a: Complex, b: Complex): Complex {
  return new Complex(a.r + b.r, a.i + b.i);
}

export function subtract(a: Complex, b: Complex): Complex {
  return new Complex(a.r - b.r, a.i - b.i);
}

export function multiply(a: Complex, b: Complex): Complex {
  return new Complex(a.r * b.r - a.i * b.i, a.r * b.i + a.i * b.r);
}

export function inverse(a: Complex): Complex {
  return new Complex(
    a.r / (a.r * a.r + a.i * a.i),
    -a.i / (a.r * a.r + a.i * a.i)
  );
}

export function divide(a: Complex, b: Complex): Complex {
  return multiply(a, inverse(b));
}

const E1 = new Complex(2);
const E2 = new Complex(3);
const E3 = new Complex(-5);

let N: number = 2;
const AL: Complex[] = [new Complex(6), new Complex(5)];
const AR: Complex[] = [new Complex(3), new Complex(2)];

let M: number = 1;

// input vector M, output vector M
export function eqns(input: Complex[], q: Complex): Complex[] {
  let tmp1 = copy(q);
  let tmp2 = new Complex(1);

  for (let i = 0; i < AL.length; i++) {
    tmp1 = multiply(tmp1, subtract(input[0], AL[i]));
    tmp2 = multiply(tmp2, subtract(input[0], AR[i]));
  }

  const result = subtract(tmp1, tmp2);

  return [result];
}

// input vector M, output matrix MxM
export function eqnsd(input: Complex[], q: Complex): Complex[][] {
  let tmp = new Complex(0);
  for (let j = 0; j < AL.length; j++) {
    let tmp1 = copy(q);
    let tmp2 = new Complex(1);

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
