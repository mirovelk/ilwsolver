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
}

export interface AppAction {
  type: AppActionType;
  payload?: unknown;
}

interface AddXSeedAction extends AppAction {
  type: AppActionType.AddXSeed;
}

interface RemoveXSeedAction extends AppAction {
  type: AppActionType.RemoveXSeed;
  payload: {
    index: number;
  };
}

interface CalculateAllOutputPathsAction extends AppAction {
  type: AppActionType.CalculateAllOutputPaths;
}

interface ClearInputOuputValuesAction extends AppAction {
  type: AppActionType.ClearInputOuputValues;
}

interface SetInputValuesAction extends AppAction {
  type: AppActionType.SetInputValues;
  payload: {
    inputValues: Complex[];
  };
}

interface SetXSeedsValuesAction extends AppAction {
  type: AppActionType.SetXSeedsValues;
  payload: {
    xSeedsValues: XSeedValue[];
  };
}

interface SetXSeedsMAction extends AppAction {
  type: AppActionType.SetXSeedsM;
  payload: {
    M: number;
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

interface SetSolverColorAction extends AppAction {
  type: AppActionType.SetSolverColor;
  payload: {
    solverIndex: number;
    color: paper.Color;
  };
}

export function addXSeedAction(): AddXSeedAction {
  return {
    type: AppActionType.AddXSeed,
  };
}

export function removeXSeedAction(index: number): RemoveXSeedAction {
  return {
    type: AppActionType.RemoveXSeed,
    payload: { index },
  };
}

export function calculateAllOutputPathsAction(): CalculateAllOutputPathsAction {
  return {
    type: AppActionType.CalculateAllOutputPaths,
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

export function setXSeedsValuesAction(
  xSeedsValues: XSeedValue[]
): SetXSeedsValuesAction {
  return {
    type: AppActionType.SetXSeedsValues,
    payload: { xSeedsValues },
  };
}

export function setXSeedsMAction(M: number): SetXSeedsMAction {
  return {
    type: AppActionType.SetXSeedsM,
    payload: { M },
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

export function setSolverColorAction(
  solverIndex: number,
  color: paper.Color
): SetSolverColorAction {
  return {
    type: AppActionType.SetSolverColor,
    payload: { solverIndex, color },
  };
}

export function clearInputOuputValuesAction(): ClearInputOuputValuesAction {
  return {
    type: AppActionType.ClearInputOuputValues,
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
  color: paper.Color;
  ouputValues?: ResultInQArray;
  ouputValuesValid: boolean;
}

export type Solvers = SolverState[];

export interface AppState {
  inputValues: Complex[];
  solvers: Solvers;
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
          });
        } else if (previousXSeedsValues[0].length > M) {
          draft.solvers.forEach((solver) => {
            solver.xSeed = solver.xSeed.slice(0, M);
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
      });

    case AppActionType.SetSolverColor:
      return produce(state, (draft) => {
        const solverIndex = (action as SetSolverColorAction).payload
          .solverIndex;
        const color = (action as SetSolverColorAction).payload.color;

        draft.solvers[solverIndex].color = color;
      });

    default:
      throw new Error("appReducer: Unknown action.");
  }
}
