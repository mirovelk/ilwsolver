import { complex } from 'util/complex';
import {
  eqns,
  eqnsd,
  matrixComplexToReal,
  solveInQ,
  transpose,
  vectorComplexToReal,
  vectorRealToComplex,
} from './solve';

const testCalcConfig = {
  Ex: {
    E1: complex(2),
    E2: complex(3),
    E3: complex(-5),
  },
  Ax: {
    AL: [complex(6), complex(5)],
    AR: [complex(3), complex(2)],
  },
};

test('eqns returns correct value for M=1', () => {
  expect(eqns([[0.5, 0.25]], [0.5, 0.25], testCalcConfig)).toEqual([
    [9.28125, 5.921875],
  ]);
});

test('eqns returns correct value for M=3', () => {
  expect(
    eqns(
      [
        [0.5, 0.2],
        [0.4, 0.3],
        [0.3, 0.4],
      ],
      [0.5, 0.25],
      testCalcConfig
    )
  ).toEqual([
    [11905.258487440005, 3175.397525280002],
    [8532.47024318, 5601.463081760001],
    [5322.1174444, 8279.692435200002],
  ]);
});

test('eqnsd returns correct value for M=3', () => {
  expect(
    eqnsd(
      [
        [0.5, 0.2],
        [0.4, 0.3],
        [0.3, 0.4],
        [0.2, 0.5],
      ],
      [0.25, 0.5],
      testCalcConfig
    )
  ).toEqual([
    [
      [-239666.13979740153, -481271.8861680472],
      [187880.48455548956, 216067.09353192963],
      [156832.66134852477, 218469.9162421848],
      [127915.0547454833, 220046.91939032322],
    ],
    [
      [143442.11615603045, 223664.66600025285],
      [-88207.20908706721, -538340.5370373302],
      [86654.70237996956, 228137.9373517471],
      [61589.572507444784, 229285.49281309353],
    ],
    [
      [68692.71399927042, 241491.43335244717],
      [43362.057233700805, 243983.0695667744],
      [72323.34595824647, -642494.0817255287],
      [-237.23092170085874, 247213.6722492256],
    ],
    [
      [-1774.6367865391512, 264735.09901146876],
      [-22231.833175108826, 267706.3614115031],
      [-40165.07084825763, 270282.73332464637],
      [235946.4767538032, -788608.4966181782],
    ],
  ]);
});

test('eqnsd returns correct value for M=1', () => {
  expect(eqnsd([[0.5, 0.25]], [0.5, 0.25], testCalcConfig)).toEqual([
    [[-1.125, -2.75]],
  ]);
});

test('solveInQ returns correct value for M=1', () => {
  expect(solveInQ([[0.5, 0.25]], [0.5, 0.25], testCalcConfig)).toEqual([
    [3.804535746476545, 0.15110607406879045],
  ]);
});

test('solveInQ returns correct value for M=2', () => {
  expect(
    solveInQ(
      [
        [3.8, 0.18],
        [-3.4, -4.2],
      ],
      [0.5, 0.25],
      testCalcConfig
    )
  ).toEqual([
    [3.8146494871248335, 0.18669778524910272],
    [-3.376446871533066, -4.159428721334357],
  ]);
});

test('solveInQ returns correct value for M=3', () => {
  expect(
    solveInQ(
      [
        [1.1, -0.5],
        [6, 0.4],
        [2.9, 0.4],
      ],
      [0.5, 0.25],
      testCalcConfig
    )
  ).toEqual([
    [1.0740858432655949, -0.4934167579564024],
    [5.998287899119127, 0.43201254132427974],
    [2.886920021420951, 0.42132987446173636],
  ]);
});

test('converts complex matrix to real', () => {
  expect(
    matrixComplexToReal([
      [complex(1, 2), complex(3, 4)],
      [complex(5, 6), complex(7, 8)],
    ])
  ).toEqual([
    [1, 3, -2, -4],
    [5, 7, -6, -8],
    [2, 4, 1, 3],
    [6, 8, 5, 7],
  ]);
});

test('converts complex vector to real', () => {
  expect(vectorComplexToReal([complex(1, 2), complex(3, 4)])).toEqual([
    1, 3, 2, 4,
  ]);
});

test('converts rela vector to complex', () => {
  const complexVector = [complex(1, 2), complex(3, 4), complex(5, 6)];
  expect(vectorRealToComplex(vectorComplexToReal(complexVector))).toEqual(
    complexVector
  );
});

test('transposes matrix', () => {
  expect(
    transpose([
      [1, 2],
      [3, 4],
      [5, 6],
    ])
  ).toEqual([
    [1, 3, 5],
    [2, 4, 6],
  ]);
});
