import { EntityId, EntityState } from '@reduxjs/toolkit';
import { SolveConfig } from '../../../core/solve';
import { Complex } from '../../../util/complex';

export enum OutputProjectionVariant {
  V1,
  V2,
  V3,
}

export type XSeedValue = Complex[];

export type DrawingPoint = [number, number];

export interface StageLayer {
  intialized: boolean;
  scale: number;
  x: number;
  y: number;
}

export type StageId = EntityId;

export interface Stage {
  id: StageId;
  width: number;
  height: number;
  dataLayer: StageLayer;
}

export interface Result {
  values: Complex[];
  selected: boolean;
  // TODO copy q used for calculation to prevent crashes when q path changes
}

export type XSeedId = EntityId;

export interface XSeed {
  id: XSeedId;
  value: XSeedValue;
  color: string;
  results: Result[]; // TODO move to separate entity adapter?
  resultsValid: boolean;
}

export type SheetId = EntityId;

export interface Sheet {
  id: SheetId;
  inputDrawingPoints: DrawingPoint[]; // TODO move input fileds separate inputs entity adapter?
  inputSimplifyTolerance: number;
  inputSimplifyEnabled: boolean;
  inputStageId: StageId;
  outputStageId: StageId;
  qArray: Complex[]; // derived from inputDrawingPoints afer simplify, kept for performance
  qArrayValid: boolean; // qArray can be invalid if inputDrawingPoints changed and needs to be recalculated
  xSeedIds: XSeedId[];
  xSeedHasError: boolean;
}

// TODO split into multiple slices somehow
export interface AppState {
  solvingInProgress: boolean; // TODO feature solve
  outputProjectionVariant: OutputProjectionVariant; // TODO feature interactiveStages?
  solveConfig: SolveConfig; // TODO feature solveConfig
  activeSheetId: SheetId;
  sheets: EntityState<Sheet>; // TODO extract as feature sheets? or input/output + sheets?
  xSeeds: EntityState<XSeed>;
  stages: EntityState<Stage>; // TODO extract as feature interactiveStages
}
