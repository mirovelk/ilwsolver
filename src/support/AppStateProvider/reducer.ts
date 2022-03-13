import produce, { castDraft } from 'immer';
import Paper from 'paper';

import { getDifferentColor, getNextColorWithBuffer } from '../../util/color';
import { Complex, complex, getRandomNumberBetween } from '../../util/complex';
import { stringifyForMathematica } from '../../util/mathematica';
import { ResultInQArray, solveInQArray } from '../calc/calc';

export const SIMPLIFY_INITIAL = -3;
export const SIMPLIFY_MIN = -10;
export const SIMPLIFY_MAX = 10;
export const SIMPLIFY_STEP = 0.0001;

enum AppActionType {
  AddXSeed,
  RemoveXSeed,
  CalculateAllOutputPaths,
  ClearInputOuputValues,
  SetInputValues,
  SetXSeedsValues,
  SetXSeedsM,
  SetXSeedNumberPart,
  SetSolverColor,
  SetBadPoints,
  SetInputZoom,
  SetOutputZoom,
  AddSheet,
  SetActiveSheet,
  RemoveSheet,
  SetInputSegments,
  AddInputDrawingPoint,
  SetInputSimplifyTolerance,
  SetInputSimplifyEnabled,
  SetOutputProjectionVariant,
}

export interface AppAction {
  type: AppActionType;
  payload?: unknown;
}

interface AddXSeedAction extends AppAction {
  type: AppActionType.AddXSeed;
}
export function addXSeedAction(): AddXSeedAction {
  return {
    type: AppActionType.AddXSeed,
  };
}

interface RemoveXSeedAction extends AppAction {
  type: AppActionType.RemoveXSeed;
  payload: {
    index: number;
  };
}
export function removeXSeedAction(index: number): RemoveXSeedAction {
  return {
    type: AppActionType.RemoveXSeed,
    payload: { index },
  };
}

interface CalculateAllOutputPathsAction extends AppAction {
  type: AppActionType.CalculateAllOutputPaths;
}
export function calculateAllOutputPathsAction(): CalculateAllOutputPathsAction {
  return {
    type: AppActionType.CalculateAllOutputPaths,
  };
}

interface ClearInputOuputValuesAction extends AppAction {
  type: AppActionType.ClearInputOuputValues;
}
export function clearInputOuputValuesAction(): ClearInputOuputValuesAction {
  return {
    type: AppActionType.ClearInputOuputValues,
  };
}

interface SetInputValuesAction extends AppAction {
  type: AppActionType.SetInputValues;
  payload: {
    inputValues: Complex[];
  };
}
export function setInputValuesAction(
  inputValues: Complex[]
): SetInputValuesAction {
  return {
    type: AppActionType.SetInputValues,
    payload: { inputValues },
  };
}

interface SetInputSegmentsAction extends AppAction {
  type: AppActionType.SetInputSegments;
  payload: {
    segments: paper.Segment[];
  };
}
export function setInputSegmentsAction(
  segments: paper.Segment[]
): SetInputSegmentsAction {
  return {
    type: AppActionType.SetInputSegments,
    payload: { segments },
  };
}

interface AddInputDrawingPointAction extends AppAction {
  type: AppActionType.AddInputDrawingPoint;
  payload: {
    point: paper.Point;
  };
}
export function addInputDrawingPointAction(
  point: paper.Point
): AddInputDrawingPointAction {
  return {
    type: AppActionType.AddInputDrawingPoint,
    payload: { point },
  };
}

interface SetInputSimplifyToleranceAction extends AppAction {
  type: AppActionType.SetInputSimplifyTolerance;
  payload: {
    inputSimplifyTolerance: number;
  };
}
export function setInputSimplifyToleranceAction(
  inputSimplifyTolerance: number
): SetInputSimplifyToleranceAction {
  return {
    type: AppActionType.SetInputSimplifyTolerance,
    payload: { inputSimplifyTolerance },
  };
}

interface SetInputSimplifyEnabledAction extends AppAction {
  type: AppActionType.SetInputSimplifyEnabled;
  payload: {
    inputSimplifyEnabled: boolean;
  };
}
export function setInputSimplifyEnabledAction(
  inputSimplifyEnabled: boolean
): SetInputSimplifyEnabledAction {
  return {
    type: AppActionType.SetInputSimplifyEnabled,
    payload: { inputSimplifyEnabled },
  };
}

interface SetXSeedsValuesAction extends AppAction {
  type: AppActionType.SetXSeedsValues;
  payload: {
    xSeedsValues: XSeedValue[];
  };
}
export function setXSeedsValuesAction(
  xSeedsValues: XSeedValue[]
): SetXSeedsValuesAction {
  return {
    type: AppActionType.SetXSeedsValues,
    payload: { xSeedsValues },
  };
}

interface SetXSeedsMAction extends AppAction {
  type: AppActionType.SetXSeedsM;
  payload: {
    M: number;
  };
}
export function setXSeedsMAction(M: number): SetXSeedsMAction {
  return {
    type: AppActionType.SetXSeedsM,
    payload: { M },
  };
}

interface SetXSeedNumberPartAction extends AppAction {
  type: AppActionType.SetXSeedNumberPart;
  payload: {
    solverIndex: number;
    xSeedNumberIndex: number;
    xSeedNumberPartIndex: number;
    value?: number;
  };
}
export function setXSeedNumberPartAction(
  solverIndex: number,
  xSeedNumberIndex: number,
  xSeedNumberPartIndex: number,
  value?: number
): SetXSeedNumberPartAction {
  return {
    type: AppActionType.SetXSeedNumberPart,
    payload: { solverIndex, xSeedNumberIndex, xSeedNumberPartIndex, value },
  };
}

interface SetSolverColorAction extends AppAction {
  type: AppActionType.SetSolverColor;
  payload: {
    solverIndex: number;
    color: paper.Color;
  };
}
export function setSolverColorAction(
  solverIndex: number,
  color: paper.Color
): SetSolverColorAction {
  return {
    type: AppActionType.SetSolverColor,
    payload: { solverIndex, color },
  };
}

interface SetBadPointsAction extends AppAction {
  type: AppActionType.SetBadPoints;
  payload: {
    badPoints: Complex[];
  };
}
export function setBadPointsAction(badPoints: Complex[]): SetBadPointsAction {
  return {
    type: AppActionType.SetBadPoints,
    payload: {
      badPoints,
    },
  };
}

interface SetInputZoomAction extends AppAction {
  type: AppActionType.SetInputZoom;
  payload: {
    zoom: number;
  };
}
export function setInputZoomAction(zoom: number): SetInputZoomAction {
  return {
    type: AppActionType.SetInputZoom,
    payload: { zoom },
  };
}

interface SetOutputZoomAction extends AppAction {
  type: AppActionType.SetOutputZoom;
  payload: {
    zoom: number;
  };
}
export function setOutputZoomAction(zoom: number): SetOutputZoomAction {
  return {
    type: AppActionType.SetOutputZoom,
    payload: { zoom },
  };
}

interface AddSheetAction extends AppAction {
  type: AppActionType.AddSheet;
}
export function addSheetAction(): AddSheetAction {
  return {
    type: AppActionType.AddSheet,
  };
}

interface SetActiveSheetAction extends AppAction {
  type: AppActionType.SetActiveSheet;
  payload: {
    sheetIndex: number;
  };
}
export function setActiveSheetAction(sheetIndex: number): SetActiveSheetAction {
  return {
    type: AppActionType.SetActiveSheet,
    payload: { sheetIndex },
  };
}

interface RemoveSheetAction extends AppAction {
  type: AppActionType.RemoveSheet;
  payload: {
    sheetIndex: number;
  };
}
export function removeSheetAction(sheetIndex: number): RemoveSheetAction {
  return {
    type: AppActionType.RemoveSheet,
    payload: { sheetIndex },
  };
}

interface SetOutputProjectionVariantAction extends AppAction {
  type: AppActionType.SetOutputProjectionVariant;
  payload: {
    outputProjectionVariant: OutputProjectionVariant;
  };
}
export function setOutputProjectionVariantAction(
  outputProjectionVariant: number
): SetOutputProjectionVariantAction {
  return {
    type: AppActionType.SetOutputProjectionVariant,
    payload: { outputProjectionVariant },
  };
}

export function getRandomXSeedPartNumber(): number {
  return getRandomNumberBetween(-10, 10);
}

function getRandomXSeedNumber(): Complex {
  return [getRandomXSeedPartNumber(), getRandomXSeedPartNumber()];
}

export enum OutputProjectionVariant {
  V1,
  V2,
  V3,
}

const initialSolver = {
  xSeed: [0, 0],
  color: new Paper.Color(255, 0, 0),
  ouputValues: undefined,
  ouputValuesValid: false,
};
function getInitialSheet(): Sheet {
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

function getInitialData(): AppState {
  return {
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
}

export const initialAppState = getInitialData();

type PartialComplex = [r?: number, i?: number]; // TODO separate into 2 fields (working copy and final xSeed)

export type XSeedValue = PartialComplex[];

export interface SolverState {
  xSeed: XSeedValue;
  calculatedXSeed?: {
    start: XSeedValue;
    end: XSeedValue;
  };
  color: paper.Color;
  ouputValues?: ResultInQArray;
  ouputValuesValid: boolean;
}

export type Solvers = SolverState[];

export interface Sheet {
  label: number;
  inputSegments: paper.Segment[];
  inputDrawingPoints: paper.Point[];
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
  secondaryActiveSheetIndecies: Set<number>;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  const { type } = action;

  switch (type) {
    case AppActionType.CalculateAllOutputPaths:
      const nextState = produce(state, (draft) => {
        draft.sheets[draft.activeSheetIndex].solvers.forEach((solver) => {
          const ouptputValues = solveInQArray(
            solver.xSeed as Complex[], // TODO remove when types are more tight
            draft.sheets[draft.activeSheetIndex].inputValues
          );
          solver.ouputValues = ouptputValues;
          solver.calculatedXSeed = {
            start: solver.ouputValues.map((output) => output[0]),
            end: solver.ouputValues.map((output) => output[output.length - 1]),
          };
          solver.ouputValuesValid = true;
        });
      });
      console.log(
        stringifyForMathematica(
          nextState.sheets[nextState.activeSheetIndex].inputValues
        )
      );
      // console.log(
      //   JSON.stringify(
      //     nextState.sheets[nextState.activeSheetIndex].solvers.map(
      //       (solver) => solver.ouputValues
      //     )
      //   )
      //     .replaceAll("[", "{")
      //     .replaceAll("]", "}")
      // );
      return nextState;

    case AppActionType.ClearInputOuputValues:
      return produce(state, (draft) => {
        draft.sheets[draft.activeSheetIndex].inputValues = [];
        draft.sheets[draft.activeSheetIndex].inputSegments = [];
        draft.sheets[draft.activeSheetIndex].inputDrawingPoints = [];
        draft.sheets[draft.activeSheetIndex].solvers.forEach((solver) => {
          solver.ouputValues = [];
          solver.ouputValuesValid = false;
          solver.calculatedXSeed = undefined;
        });
      });

    case AppActionType.SetInputValues:
      return produce(state, (draft) => {
        draft.sheets[draft.activeSheetIndex].inputValues = (
          action as SetInputValuesAction
        ).payload.inputValues;
      });

    case AppActionType.SetXSeedsValues:
      return produce(state, (draft) => {
        const payloadXSeedsValues = (action as SetXSeedsValuesAction).payload
          .xSeedsValues;
        const previousXSeedsValues = state.sheets[
          draft.activeSheetIndex
        ].solvers.map((solver) => solver.xSeed);

        const colorsBuffer = draft.sheets[draft.activeSheetIndex].solvers
          .slice(0, payloadXSeedsValues.length)
          .map((solver) => solver.color);

        if (
          JSON.stringify(previousXSeedsValues) !==
          JSON.stringify(payloadXSeedsValues)
        ) {
          draft.sheets[draft.activeSheetIndex].solvers =
            payloadXSeedsValues.map(
              (payloadXSeedValues, payloadXSeedValuesIndex) => ({
                ...(payloadXSeedValuesIndex <
                draft.sheets[draft.activeSheetIndex].solvers.length
                  ? {
                      ...draft.sheets[draft.activeSheetIndex].solvers[
                        payloadXSeedValuesIndex
                      ],
                      ouputValuesValid:
                        draft.sheets[draft.activeSheetIndex].solvers[
                          payloadXSeedValuesIndex
                        ].ouputValuesValid &&
                        JSON.stringify(
                          draft.sheets[draft.activeSheetIndex].solvers[
                            payloadXSeedValuesIndex
                          ].xSeed
                        ) === JSON.stringify(payloadXSeedValues),
                      calculatedXSeed:
                        JSON.stringify(
                          draft.sheets[draft.activeSheetIndex].solvers[
                            payloadXSeedValuesIndex
                          ].xSeed
                        ) === JSON.stringify(payloadXSeedValues)
                          ? draft.sheets[draft.activeSheetIndex].solvers[
                              payloadXSeedValuesIndex
                            ].calculatedXSeed
                          : undefined,
                      color:
                        draft.sheets[draft.activeSheetIndex].solvers[
                          payloadXSeedValuesIndex
                        ].color,
                    }
                  : {
                      ouputValuesValid: false,
                      color: getNextColorWithBuffer(colorsBuffer),
                    }),
                xSeed: payloadXSeedValues,
              })
            );
        }
      });

    case AppActionType.SetXSeedsM:
      return produce(state, (draft) => {
        const M = (action as SetXSeedsMAction).payload.M;
        const previousXSeedsValues = state.sheets[
          draft.activeSheetIndex
        ].solvers.map((solver) => solver.xSeed);
        if (previousXSeedsValues[0].length < M) {
          draft.sheets[draft.activeSheetIndex].solvers.forEach((solver) => {
            solver.xSeed = [
              ...solver.xSeed,
              ...new Array(M - solver.xSeed.length)
                .fill(null)
                .map((_) => getRandomXSeedNumber()),
            ];
            solver.calculatedXSeed = undefined;
          });
        } else if (previousXSeedsValues[0].length > M) {
          draft.sheets[draft.activeSheetIndex].solvers.forEach((solver) => {
            solver.xSeed = solver.xSeed.slice(0, M);
            solver.calculatedXSeed = undefined;
          });
        }
      });

    case AppActionType.AddXSeed:
      return produce(state, (draft) => {
        const M = draft.sheets[draft.activeSheetIndex].solvers[0].xSeed.length;
        const previousColors = draft.sheets[draft.activeSheetIndex].solvers.map(
          (solver) => solver.color
        );

        draft.sheets[draft.activeSheetIndex].solvers.push({
          xSeed: new Array(M).fill(null).map(() => getRandomXSeedNumber()),
          color: getDifferentColor(previousColors),
          ouputValues: undefined,
          ouputValuesValid: false,
        });
      });

    case AppActionType.RemoveXSeed:
      return produce(state, (draft) => {
        const index = (action as RemoveXSeedAction).payload.index;
        if (draft.sheets[draft.activeSheetIndex].solvers.length > 1) {
          draft.sheets[draft.activeSheetIndex].solvers = draft.sheets[
            draft.activeSheetIndex
          ].solvers.filter((_, solverIndex) => solverIndex !== index);
        }
      });

    case AppActionType.SetXSeedNumberPart:
      return produce(state, (draft) => {
        const typedAction = action as SetXSeedNumberPartAction;
        const solverIndex = typedAction.payload.solverIndex;
        const xSeedNumberIndex = typedAction.payload.xSeedNumberIndex;
        const xSeedNumberPartIndex = typedAction.payload.xSeedNumberPartIndex;
        const value = typedAction.payload.value;

        draft.sheets[draft.activeSheetIndex].solvers[
          solverIndex
        ].ouputValuesValid = false;
        draft.sheets[draft.activeSheetIndex].solvers[solverIndex].xSeed[
          xSeedNumberIndex
        ][xSeedNumberPartIndex] = value;
        draft.sheets[draft.activeSheetIndex].solvers[
          solverIndex
        ].calculatedXSeed = undefined;
      });

    case AppActionType.SetSolverColor:
      return produce(state, (draft) => {
        const solverIndex = (action as SetSolverColorAction).payload
          .solverIndex;
        const color = (action as SetSolverColorAction).payload.color;

        draft.sheets[draft.activeSheetIndex].solvers[solverIndex].color = color;
      });

    case AppActionType.SetBadPoints:
      return produce(state, (draft) => {
        draft.badPoints = (action as SetBadPointsAction).payload.badPoints;
      });

    case AppActionType.SetInputZoom:
      return produce(state, (draft) => {
        draft.inputZoom = (action as SetInputZoomAction).payload.zoom;
      });

    case AppActionType.SetOutputZoom:
      return produce(state, (draft) => {
        draft.outputZoom = (action as SetOutputZoomAction).payload.zoom;
      });

    case AppActionType.AddSheet:
      return produce(state, (draft) => {
        const newSheet = castDraft(getInitialSheet());
        newSheet.label = state.sheets[draft.sheets.length - 1].label + 1;

        const lastSheetSolvers = state.sheets[draft.sheets.length - 1].solvers;

        newSheet.solvers = lastSheetSolvers.map((lastSheetSolver) => ({
          ...initialSolver,
          color: lastSheetSolver.color,
          xSeed:
            lastSheetSolver.ouputValues && lastSheetSolver.ouputValuesValid
              ? lastSheetSolver.ouputValues.map(
                  (output) => output[output.length - 1]
                )
              : lastSheetSolver.xSeed,
        }));

        draft.sheets.push(newSheet);
        draft.activeSheetIndex = draft.sheets.length - 1;
        draft.secondaryActiveSheetIndecies = new Set();
      });

    case AppActionType.SetActiveSheet:
      return produce(state, (draft) => {
        draft.activeSheetIndex = (
          action as SetActiveSheetAction
        ).payload.sheetIndex;
      });

    case AppActionType.RemoveSheet:
      return produce(state, (draft) => {
        const removedSheetIndex = (action as SetActiveSheetAction).payload
          .sheetIndex;

        draft.sheets = draft.sheets.filter(
          (_, index) => index !== removedSheetIndex
        );
        if (removedSheetIndex <= draft.activeSheetIndex) {
          draft.activeSheetIndex -= 1;
        }
      });

    case AppActionType.SetInputSegments:
      return produce(state, (draft) => {
        draft.sheets[draft.activeSheetIndex].inputSegments = castDraft(
          (action as SetInputSegmentsAction).payload.segments
        );
      });

    case AppActionType.AddInputDrawingPoint:
      return produce(state, (draft) => {
        draft.sheets[draft.activeSheetIndex].inputDrawingPoints.push(
          castDraft((action as AddInputDrawingPointAction).payload.point)
        );
      });

    case AppActionType.SetInputSimplifyTolerance:
      return produce(state, (draft) => {
        draft.sheets[draft.activeSheetIndex].inputSimplifyTolerance = castDraft(
          (action as SetInputSimplifyToleranceAction).payload
            .inputSimplifyTolerance
        );
      });

    case AppActionType.SetInputSimplifyEnabled:
      return produce(state, (draft) => {
        draft.sheets[draft.activeSheetIndex].inputSimplifyEnabled = castDraft(
          (action as SetInputSimplifyEnabledAction).payload.inputSimplifyEnabled
        );
      });

    case AppActionType.SetOutputProjectionVariant:
      return produce(state, (draft) => {
        draft.outputProjectionVariant = castDraft(
          (action as SetOutputProjectionVariantAction).payload
            .outputProjectionVariant
        );
      });

    default:
      throw new Error("appReducer: Unknown action.");
  }
}
