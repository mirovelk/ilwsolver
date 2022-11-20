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

export function getRandomNumberBetween(min: number, max: number) {
  return parseFloat((Math.random() * (max - min + 1) + min).toFixed(3));
}

export function getRandomComplexNumber(min: number, max: number): Complex {
  return complex(
    getRandomNumberBetween(min, max),
    getRandomNumberBetween(min, max)
  );
}
