import Paper from 'paper';

import { getNextColorWithBuffer } from '../../../util/color';
import { complex } from '../../../util/complex';
import { AppState, OutputProjectionVariant, Sheet } from './types';

export const SIMPLIFY_INITIAL = -3;

export const initialSolver = {
  xSeed: [0, 0],
  color: new Paper.Color(255, 0, 0),
  ouputValues: undefined,
  ouputValuesValid: false,
};

export function getInitialSheet(): Sheet {
  const seeds = [
    [complex(2, -3), complex(3, -2)],
    [complex(2, 3), complex(2, 4)],
  ];
  const colorsBuffer: paper.Color[] = [];
  return {
    label: 1,
    inputValues: [],
    inputSegments: [],
    inputDrawingPoints: [],
    inputSimplifyTolerance: SIMPLIFY_INITIAL,
    inputSimplifyEnabled: true,
    solvers: seeds.map((xSeed) => ({
      ...initialSolver,
      xSeed,
      color: getNextColorWithBuffer(colorsBuffer),
    })),
  };
}

export const initialState: AppState = {
  sheets: [getInitialSheet()],
  activeSheetIndex: 0,
  secondaryActiveSheetIndecies: new Set(),
  inputZoom: 1,
  outputZoom: 1,
  outputProjectionVariant: OutputProjectionVariant.V1,
  badPoints: [
    [-58.0141, 0],
    [-55.6141, 0],
    [-2.87771, 0],
    [-1.13319, 0],
    [-1, 0],
    [-0.882464, 0],
    [-0.347498, 0],
    [-0.21514, -9.43404],
    [-0.21514, 9.43404],
    [-0.139849, -0.990173],
    [-0.139849, 0.990173],
    [-0.017981, 0],
    [-0.0172372, 0],
    [-0.00241602, -0.105944],
    [-0.00241602, 0.105944],
    [0, 0],
    [0.021071, 0],
    [0.168469, -0.432772],
    [0.168469, 0.432772],
    [0.306398, -0.528142],
    [0.306398, 0.528142],
    [0.781129, -2.00661],
    [0.781129, 2.00661],
    [0.821853, -1.41664],
    [0.821853, 1.41664],
    [1, 0],
    [47.4586, 0],
  ],
};
