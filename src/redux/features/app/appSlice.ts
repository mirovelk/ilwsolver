import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { castDraft } from 'immer';
import Paper from 'paper';
import equal from 'fast-deep-equal';

import { solveInQArray, Ax, Ex } from '../../../support/calc/calc';
import { getDifferentColor, getNextColorWithBuffer } from '../../../util/color';
import {
  complex,
  Complex,
  getRandomNumberBetween,
} from '../../../util/complex';
import { stringifyForMathematica } from '../../../util/mathematica';
import { RootState } from '../../store';
import { getInitialSheet, initialSolver, initialState } from './initialState';
import { OutputProjectionVariant, StoredPoint, XSeedValue } from './types';

export function getRandomXSeedPartNumber(): number {
  return getRandomNumberBetween(-10, 10);
}

function getRandomXSeedNumber(): Complex {
  return [getRandomXSeedPartNumber(), getRandomXSeedPartNumber()];
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    calculateAllOutputPaths: (state) => {
      state.sheets[state.activeSheetIndex].solvers.forEach((solver) => {
        const ouptputValues = solveInQArray(
          solver.xSeed,
          state.sheets[state.activeSheetIndex].inputValues,
          state.calcConfig
        );
        solver.ouputValues = ouptputValues;
        solver.calculatedXSeed = {
          start: solver.ouputValues.map((output) => output[0]),
          end: solver.ouputValues.map((output) => output[output.length - 1]),
        };
        solver.ouputValuesValid = true;
      });
      console.log(
        stringifyForMathematica(
          state.sheets[state.activeSheetIndex].inputValues
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
    },

    clearActiveSheetInputOuputValues: (state) => {
      state.sheets[state.activeSheetIndex].inputValues = [];
      state.sheets[state.activeSheetIndex].inputDrawingPoints = [];
      state.sheets[state.activeSheetIndex].solvers.forEach((solver) => {
        solver.ouputValues = [];
        solver.ouputValuesValid = false;
        solver.calculatedXSeed = undefined;
      });
    },

    setInputValues: (state, action: PayloadAction<Complex[]>) => {
      state.sheets[state.activeSheetIndex].inputValues = action.payload;
    },

    setXSeedsValues: (state, action: PayloadAction<XSeedValue[]>) => {
      // optimized to not re-render if the values are the same and the ouput is valid
      const payloadXSeedsValues = action.payload;
      const prevXSeedsValues = state.sheets[state.activeSheetIndex].solvers.map(
        (solver) => solver.xSeed
      );

      // only continue if there's any change in the xSeeds values
      if (!equal(payloadXSeedsValues, prevXSeedsValues)) {
        const colorsBuffer = state.sheets[state.activeSheetIndex].solvers
          .slice(0, payloadXSeedsValues.length)
          .map((solver) => new Paper.Color(solver.color));
        const prevSolvers = state.sheets[state.activeSheetIndex].solvers;

        state.sheets[state.activeSheetIndex].solvers = payloadXSeedsValues.map(
          (payloadXSeedValues, payloadXSeedValuesIndex) => {
            // try to reuse the previous solver if it exists
            if (payloadXSeedValuesIndex < prevSolvers.length) {
              const prevSolver = prevSolvers[payloadXSeedValuesIndex];
              // if the xSeed values are the same, reuse the previous solver
              if (equal(payloadXSeedValues, prevSolver.xSeed)) {
                return prevSolver;
              } else {
                // if the xSeed values are different, create a new solver
                return {
                  ...prevSolver,
                  ouputValuesValid: false,
                  calculatedXSeed: undefined,
                  color: prevSolver.color,
                  xSeed: payloadXSeedValues,
                };
              }
            } else {
              // there's more xSeed values than solvers, create a new solver
              return {
                ouputValuesValid: false,
                color: getNextColorWithBuffer(colorsBuffer).toCSS(true),
                xSeed: payloadXSeedValues,
              };
            }
          }
        );
      }
    },

    setXSeedsM: (state, action: PayloadAction<number>) => {
      const M = action.payload;
      const previousXSeedsValues = state.sheets[
        state.activeSheetIndex
      ].solvers.map((solver) => solver.xSeed);
      if (previousXSeedsValues[0].length < M) {
        state.sheets[state.activeSheetIndex].solvers.forEach((solver) => {
          solver.xSeed = [
            ...solver.xSeed,
            ...new Array(M - solver.xSeed.length)
              .fill(null)
              .map((_) => getRandomXSeedNumber()),
          ];
          solver.calculatedXSeed = undefined;
        });
      } else if (previousXSeedsValues[0].length > M) {
        state.sheets[state.activeSheetIndex].solvers.forEach((solver) => {
          solver.xSeed = solver.xSeed.slice(0, M);
          solver.calculatedXSeed = undefined;
        });
      }
    },

    addXSeed: (state) => {
      const M = state.sheets[state.activeSheetIndex].solvers[0].xSeed.length;
      const previousColors = state.sheets[state.activeSheetIndex].solvers.map(
        (solver) => new Paper.Color(solver.color)
      );

      state.sheets[state.activeSheetIndex].solvers.push({
        xSeed: new Array(M).fill(null).map(() => getRandomXSeedNumber()),
        color: getDifferentColor(previousColors).toCSS(true),
        ouputValues: undefined,
        ouputValuesValid: false,
      });
    },

    removeXSeedWithIndex: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (state.sheets[state.activeSheetIndex].solvers.length > 1) {
        state.sheets[state.activeSheetIndex].solvers = state.sheets[
          state.activeSheetIndex
        ].solvers.filter((_, solverIndex) => solverIndex !== index);
      }
    },

    setXSeedNumberPart: (
      state,
      action: PayloadAction<{
        solverIndex: number;
        xSeedNumberIndex: number;
        xSeedNumberPartIndex: number;
        value: number;
      }>
    ) => {
      const { solverIndex, xSeedNumberIndex, xSeedNumberPartIndex, value } =
        action.payload;

      state.sheets[state.activeSheetIndex].solvers[
        solverIndex
      ].ouputValuesValid = false;
      state.sheets[state.activeSheetIndex].solvers[solverIndex].xSeed[
        xSeedNumberIndex
      ][xSeedNumberPartIndex] = value;
      state.sheets[state.activeSheetIndex].solvers[
        solverIndex
      ].calculatedXSeed = undefined;
    },

    setSolverColor: (
      state,
      action: PayloadAction<{
        solverIndex: number;
        color: string;
      }>
    ) => {
      const { solverIndex, color } = action.payload;
      state.sheets[state.activeSheetIndex].solvers[solverIndex].color = color;
    },

    setBadPoints: (state, action: PayloadAction<Complex[]>) => {
      state.badPoints = action.payload;
    },

    setInputZoom: (state, action: PayloadAction<number>) => {
      state.inputZoom = action.payload;
    },

    setOutputZoom: (state, action: PayloadAction<number>) => {
      state.outputZoom = action.payload;
    },

    addSheet: (state) => {
      const newSheet = getInitialSheet();
      newSheet.label = state.sheets[state.sheets.length - 1].label + 1;

      const lastSheetSolvers = state.sheets[state.sheets.length - 1].solvers;

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

      state.sheets.push(castDraft(newSheet));
      state.activeSheetIndex = state.sheets.length - 1;
    },

    setActiveSheetIndex: (state, action: PayloadAction<number>) => {
      state.activeSheetIndex = action.payload;
    },

    removeSheetWithIndex: (state, action: PayloadAction<number>) => {
      const removedSheetIndex = action.payload;
      state.sheets = state.sheets.filter(
        (_, index) => index !== removedSheetIndex
      );
      if (
        state.activeSheetIndex !== 0 &&
        removedSheetIndex <= state.activeSheetIndex
      ) {
        state.activeSheetIndex -= 1;
      }
    },

    addInputDrawingPoint: (state, action: PayloadAction<StoredPoint>) => {
      state.sheets[state.activeSheetIndex].inputDrawingPoints.push(
        action.payload
      );
    },

    setInputSimplifyTolerance: (state, action: PayloadAction<number>) => {
      state.sheets[state.activeSheetIndex].inputSimplifyTolerance =
        action.payload;
    },

    setInputSimplifyEnabled: (state, action: PayloadAction<boolean>) => {
      state.sheets[state.activeSheetIndex].inputSimplifyEnabled =
        action.payload;
    },

    setOutputProjectionVariant: (
      state,
      action: PayloadAction<OutputProjectionVariant>
    ) => {
      state.outputProjectionVariant = action.payload;
    },

    setCalcConfigExCPart(
      state,
      action: PayloadAction<{
        cPartValue: number;
        cPartIndex: number;
        Ex: keyof Ex;
      }>
    ) {
      const { cPartValue, cPartIndex, Ex } = action.payload;
      state.calcConfig.Ex[Ex][cPartIndex] = cPartValue;
      // TODO reset everything else
    },

    setCalcConfigAxN(state, action: PayloadAction<{ N: number }>) {
      const { N } = action.payload;
      const prevN = state.calcConfig.Ax.AL.length;

      if (prevN < N) {
        state.calcConfig.Ax.AL.push(complex(0));
        state.calcConfig.Ax.AR.push(complex(0));
      } else if (prevN > N && N > 0) {
        state.calcConfig.Ax.AL.pop();
        state.calcConfig.Ax.AR.pop();
      }
    },

    setCalcConfigAxArrayCPart(
      state,
      action: PayloadAction<{
        cPartValue: number;
        cPartIndex: number;
        axCIndex: number;
        Ax: keyof Ax;
      }>
    ) {
      const { cPartValue, cPartIndex, axCIndex: AxCIndex, Ax } = action.payload;
      state.calcConfig.Ax[Ax][AxCIndex][cPartIndex] = cPartValue;
      // TODO reset everything else
    },
  },
});

// Selectors
export const selectBadPoints = (state: RootState) => state.app.badPoints;

export const selectCalcConfig = (state: RootState) => state.app.calcConfig;
export const selectN = (state: RootState) => state.app.calcConfig.Ax.AL.length;

export const selectInputZoom = (state: RootState) => state.app.inputZoom;
export const selectOutputZoom = (state: RootState) => state.app.outputZoom;
export const selectOutputProjectionVariant = (state: RootState) =>
  state.app.outputProjectionVariant;
export const selectActiveSheetIndex = (state: RootState) =>
  state.app.activeSheetIndex;
export const selectSheets = (state: RootState) => state.app.sheets;

export const selectActiveSheet = (state: RootState) =>
  state.app.sheets[state.app.activeSheetIndex];
export const selectPreviousSheet = (state: RootState) =>
  state.app.sheets[state.app.activeSheetIndex - 1];

export const selectActiveSheetIputValues = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.inputValues
);
export const selectActiveSheetIputDrawingPoints = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.inputDrawingPoints
);
export const selectActiveSheetSolvers = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.solvers
);
export const selectActiveSheetInputSimplifyConfig = createSelector(
  [selectActiveSheet],
  (activeSheet) => ({
    enabled: activeSheet.inputSimplifyEnabled,
    tolerance: activeSheet.inputSimplifyTolerance,
  })
);
export const selectPreviousSheetEndInputValue = createSelector(
  [selectPreviousSheet],
  (previousSheet) =>
    (previousSheet &&
      previousSheet.inputValues &&
      previousSheet.inputValues[previousSheet.inputValues.length - 1]) ||
    undefined
);

const { actions, reducer } = appSlice;

export const {
  addInputDrawingPoint,
  addSheet,
  addXSeed,
  calculateAllOutputPaths,
  clearActiveSheetInputOuputValues,
  removeSheetWithIndex,
  removeXSeedWithIndex,
  setActiveSheetIndex,
  setBadPoints,
  setInputSimplifyEnabled,
  setInputSimplifyTolerance,
  setInputValues,
  setInputZoom,
  setOutputProjectionVariant,
  setOutputZoom,
  setSolverColor,
  setXSeedNumberPart,
  setXSeedsM,
  setXSeedsValues,
  setCalcConfigExCPart,
  setCalcConfigAxN,
  setCalcConfigAxArrayCPart,
} = actions;

export default reducer;
