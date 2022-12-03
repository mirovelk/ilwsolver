import { ResultInQArray } from '../../../support/calc/calc';
import { Complex } from '../../../util/complex';

export enum OutputProjectionVariant {
  V1,
  V2,
  V3,
}

export type XSeedValue = Complex[];

export type StoredPoint = [number, number];

export interface SolverState {
  xSeed: XSeedValue;
  calculatedXSeed?: {
    start: XSeedValue;
    end: XSeedValue;
  };
  color: string; // Paper.Color constructors do not accept components array, use .toCSS(true)
  ouputValues?: ResultInQArray;
  ouputValuesValid: boolean;
}

export type Solvers = SolverState[];

export interface Sheet {
  label: number;
  inputDrawingPoints: StoredPoint[];
  inputValues: Complex[];
  inputSimplifyTolerance: number;
  inputSimplifyEnabled: boolean;
  solvers: Solvers;
}

export interface AppState {
  inputZoom: number;
  outputZoom: number;
  outputProjectionVariant: OutputProjectionVariant;
  badPoints: Complex[];
  sheets: Sheet[];
  activeSheetIndex: number;
}
