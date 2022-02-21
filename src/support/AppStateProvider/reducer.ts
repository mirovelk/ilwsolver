import produce from 'immer';

import { getDifferentColor, getNextColorWithBuffer } from '../../util/color';
import { Complex, getRandomNumberBetween } from '../../util/complex';
import { ResultInQArray, solveInQArray } from '../calc/calc';

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
  CopyResultToXSeed,
  SetBadPoints,
  SetInputZoom,
  SetOutputZoom,
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

interface CopyResultToXSeedAction extends AppAction {
  type: AppActionType.CopyResultToXSeed;
}
export function copyResultToXSeedAction(): CopyResultToXSeedAction {
  return {
    type: AppActionType.CopyResultToXSeed,
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

export function getRandomXSeedPartNumber(): number {
  return getRandomNumberBetween(-10, 10);
}

function getRandomXSeedNumber(): Complex {
  return [getRandomXSeedPartNumber(), getRandomXSeedPartNumber()];
}

function getInitialData(seeds: Complex[][]): AppState {
  const colorsBuffer: paper.Color[] = [];
  return {
    inputValues: [],
    solvers: seeds.map((xSeed, xSeedIndex) => ({
      xSeed,
      color: getNextColorWithBuffer(colorsBuffer),
      ouputValues: undefined,
      ouputValuesValid: false,
    })),
    inputZoom: 1,
    outputZoom: 1,
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

export const initialAppState = getInitialData([
  [
    [2, -3],
    [3, -2],
  ],
  [
    [2, 3],
    [2, 4],
  ],
]);

type PartialComplex = [r?: number, i?: number]; // TODO separate into 2 fields (working copy and final xSeed)

export type XSeedValue = PartialComplex[];

export interface SolverState {
  xSeed: XSeedValue;
  calculatedXSeed?: XSeedValue;
  color: paper.Color;
  ouputValues?: ResultInQArray;
  ouputValuesValid: boolean;
}

export type Solvers = SolverState[];

export interface AppState {
  inputValues: Complex[];
  inputZoom: number;
  outputZoom: number;
  solvers: Solvers;
  badPoints: Complex[];
}

export function appReducer(state: AppState, action: AppAction): AppState {
  const { type } = action;

  switch (type) {
    case AppActionType.CalculateAllOutputPaths:
      const nextState = produce(state, (draft) => {
        draft.solvers.forEach((solver) => {
          solver.ouputValues = solveInQArray(
            solver.xSeed as Complex[], // TODO remove when types are more tight
            state.inputValues
          );
          solver.calculatedXSeed = solver.ouputValues.map(
            (output) => output[0]
          );
          solver.ouputValuesValid = true;
        });
      });
      console.log(
        JSON.stringify(nextState.inputValues)
          .replaceAll("[", "{")
          .replaceAll("]", "}")
      );
      console.log(
        JSON.stringify(nextState.solvers.map((solver) => solver.ouputValues))
          .replaceAll("[", "{")
          .replaceAll("]", "}")
      );
      return nextState;

    case AppActionType.ClearInputOuputValues:
      return produce(state, (draft) => {
        draft.inputValues = [];
        draft.solvers.forEach((solver) => {
          solver.ouputValues = [];
          solver.ouputValuesValid = false;
          solver.calculatedXSeed = undefined;
        });
      });

    case AppActionType.SetInputValues:
      return produce(state, (draft) => {
        draft.inputValues = (
          action as SetInputValuesAction
        ).payload.inputValues;
      });

    case AppActionType.SetXSeedsValues:
      return produce(state, (draft) => {
        const payloadXSeedsValues = (action as SetXSeedsValuesAction).payload
          .xSeedsValues;
        const previousXSeedsValues = state.solvers.map(
          (solver) => solver.xSeed
        );

        const colorsBuffer = draft.solvers
          .slice(0, payloadXSeedsValues.length)
          .map((solver) => solver.color);

        if (
          JSON.stringify(previousXSeedsValues) !==
          JSON.stringify(payloadXSeedsValues)
        ) {
          draft.solvers = payloadXSeedsValues.map(
            (payloadXSeedValues, payloadXSeedValuesIndex) => ({
              ...(payloadXSeedValuesIndex < draft.solvers.length
                ? {
                    ...draft.solvers[payloadXSeedValuesIndex],
                    ouputValuesValid:
                      draft.solvers[payloadXSeedValuesIndex].ouputValuesValid &&
                      JSON.stringify(
                        draft.solvers[payloadXSeedValuesIndex].xSeed
                      ) === JSON.stringify(payloadXSeedValues),
                    calculatedXSeed:
                      JSON.stringify(
                        draft.solvers[payloadXSeedValuesIndex].xSeed
                      ) === JSON.stringify(payloadXSeedValues)
                        ? draft.solvers[payloadXSeedValuesIndex].calculatedXSeed
                        : undefined,
                    color: draft.solvers[payloadXSeedValuesIndex].color,
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
        const previousXSeedsValues = state.solvers.map(
          (solver) => solver.xSeed
        );
        if (previousXSeedsValues[0].length < M) {
          draft.solvers.forEach((solver) => {
            solver.xSeed = [
              ...solver.xSeed,
              ...new Array(M - solver.xSeed.length)
                .fill(null)
                .map((_) => getRandomXSeedNumber()),
            ];
            solver.calculatedXSeed = undefined;
          });
        } else if (previousXSeedsValues[0].length > M) {
          draft.solvers.forEach((solver) => {
            solver.xSeed = solver.xSeed.slice(0, M);
            solver.calculatedXSeed = undefined;
          });
        }
      });

    case AppActionType.AddXSeed:
      return produce(state, (draft) => {
        const M = draft.solvers[0].xSeed.length;
        const previousColors = draft.solvers.map((solver) => solver.color);

        draft.solvers.push({
          xSeed: new Array(M).fill(null).map(() => getRandomXSeedNumber()),
          color: getDifferentColor(previousColors),
          ouputValues: undefined,
          ouputValuesValid: false,
        });
      });

    case AppActionType.RemoveXSeed:
      return produce(state, (draft) => {
        const index = (action as RemoveXSeedAction).payload.index;
        if (draft.solvers.length > 1) {
          draft.solvers = draft.solvers.filter(
            (_, solverIndex) => solverIndex !== index
          );
        }
      });

    case AppActionType.SetXSeedNumberPart:
      return produce(state, (draft) => {
        const typedAction = action as SetXSeedNumberPartAction;
        const solverIndex = typedAction.payload.solverIndex;
        const xSeedNumberIndex = typedAction.payload.xSeedNumberIndex;
        const xSeedNumberPartIndex = typedAction.payload.xSeedNumberPartIndex;
        const value = typedAction.payload.value;

        draft.solvers[solverIndex].ouputValuesValid = false;
        draft.solvers[solverIndex].xSeed[xSeedNumberIndex][
          xSeedNumberPartIndex
        ] = value;
        draft.solvers[solverIndex].calculatedXSeed = undefined;
      });

    case AppActionType.SetSolverColor:
      return produce(state, (draft) => {
        const solverIndex = (action as SetSolverColorAction).payload
          .solverIndex;
        const color = (action as SetSolverColorAction).payload.color;

        draft.solvers[solverIndex].color = color;
      });

    case AppActionType.CopyResultToXSeed:
      return produce(state, (draft) => {
        draft.solvers.forEach((solver) => {
          if (solver.calculatedXSeed) {
            solver.xSeed = solver.calculatedXSeed;
          }
        });
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

    default:
      throw new Error("appReducer: Unknown action.");
  }
}
