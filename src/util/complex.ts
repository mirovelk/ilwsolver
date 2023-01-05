import { complex as mathComplex } from 'mathjs';

export type Complex = [r: number, i: number];

export function complex(r: number, i = 0): Complex {
  return [r, i];
}

export function copy(c: Complex): Complex {
  return [...c];
}

export function add(a: Complex, b: Complex): Complex {
  return [a[0] + b[0], a[1] + b[1]];
}

export function subtract(a: Complex, b: Complex): Complex {
  return [a[0] - b[0], a[1] - b[1]];
}

export function multiply(a: Complex, b: Complex): Complex {
  return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
}

export function inverse(a: Complex): Complex {
  return [
    a[0] / (a[0] * a[0] + a[1] * a[1]),
    -a[1] / (a[0] * a[0] + a[1] * a[1]),
  ];
}

export function divide(a: Complex, b: Complex): Complex {
  return multiply(a, inverse(b));
}

export function minus(a: Complex): Complex {
  return complex(-a[0], -a[1]);
}

export function abs(a: Complex): number {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
}

export function getRandomNumberBetween(min: number, max: number) {
  return parseFloat((Math.random() * (max - min + 1) + min).toFixed(20));
}

export function getRandomComplexNumber(min: number, max: number): Complex {
  return complex(
    getRandomNumberBetween(min, max),
    getRandomNumberBetween(min, max)
  );
}

function stringifyNumber(number: number, full: boolean): string {
  if (full) {
    return number.toExponential().replaceAll('e', '*^');
  } else {
    return number
      .toExponential(3)
      .replaceAll('.000', '') // unnecessary
      .replaceAll('e+0', '') // unnecessary
      .replaceAll('e', '*^'); // used by mathematica
  }
}

export function stringifyComplex(complex: Complex, full = false): string {
  const str = stringifyNumber(complex[0], full);
  if (complex[1] < 0) {
    return `${str}-${stringifyNumber(-complex[1], full)}I`;
  } else if (complex[1] >= 0) {
    return `${str}+${stringifyNumber(complex[1], full)}I`;
  } else {
    return str;
  }
}

export function parseComplex(str: string): Complex {
  const c = [0, 0] as Complex;
  if (
    (str.slice(1).includes('+') || str.slice(1).includes('-')) &&
    !str.includes('I') // check for missing "I"
  ) {
    throw new Error(`Invalid complex number: ${str}`);
  }
  const parsed = mathComplex(str.replaceAll('*^', 'e'));
  c[0] = parsed.re;
  c[1] = parsed.im;
  return c;
}
