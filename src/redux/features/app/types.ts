import { CalcConfig, ResultInQArray } from '../../../support/calc/calc';
import { Complex } from '../../../util/complex';

export enum OutputProjectionVariant {
  V1,
  V2,
  V3,
}

export type XSeedValue = Complex[];

export type StoredPoint = [number, number];

export interface CalculatedXSeed {
  start: XSeedValue;
  end: XSeedValue;
}

export interface SolverState {
  xSeed: XSeedValue;
  calculatedXSeed?: CalculatedXSeed; // TODO could be selector
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
  calcConfig: CalcConfig;
  sheets: Sheet[];
  activeSheetIndex: number;
}
