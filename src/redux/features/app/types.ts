import { EntityId, EntityState } from '@reduxjs/toolkit';
import { CalcConfig, ResultInQArray } from '../../../support/calc/calc';
import { Complex } from '../../../util/complex';

export enum OutputProjectionVariant {
  V1,
  V2,
  V3,
}

export type XSeedValue = Complex[];

export type StoredPoint = [number, number];

export type SolverId = EntityId;

export interface Solver {
  id: SolverId;
  xSeed: XSeedValue;
  color: string; // Paper.Color constructors do not accept components array, use .toCSS(true)
  outputValues?: ResultInQArray;
  outputValuesValid: boolean;
}

export type SheetId = EntityId;

export interface Sheet {
  id: SheetId;
  inputDrawingPoints: StoredPoint[];
  inputValues: Complex[];
  inputSimplifyTolerance: number;
  inputSimplifyEnabled: boolean;
  solvers: SolverId[];
}

export interface AppState {
  solvingInProgress: boolean;
  inputZoom: number;
  outputZoom: number;
  outputProjectionVariant: OutputProjectionVariant;
  badPoints: Complex[];
  calcConfig: CalcConfig;
  activeSheetId: SheetId;
  sheets: EntityState<Sheet>;
  solvers: EntityState<Solver>;
}
