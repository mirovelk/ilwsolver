import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import Paper from 'paper';
import equal from 'fast-deep-equal';
// @ts-ignore
import calcWorker from 'workerize-loader!../../../support/calc/calc';

import {
  Ax,
  Ex,
  ResultInQArray,
  CalcConfig,
  solveInQArray,
} from '../../../support/calc/calc';
import { getDifferentColor, getNextColorWithBuffer } from '../../../util/color';
import {
  complex,
  Complex,
  getRandomNumberBetween,
} from '../../../util/complex';
import { stringifyForMathematica } from '../../../util/mathematica';
import { RootState } from '../../store';
import {
  AppState,
  OutputProjectionVariant,
  Sheet,
  StoredPoint,
  XSeedValue,
} from './types';

export function getRandomXSeedPartNumber(): number {
  return getRandomNumberBetween(-10, 10);
}

function getRandomXSeedNumber(): Complex {
  return [getRandomXSeedPartNumber(), getRandomXSeedPartNumber()];
}

const SIMPLIFY_INITIAL = -3;

function buildInitialSheet(sheet?: Partial<Sheet>): Sheet {
  const seeds = [
    [complex(2, -3), complex(3, -2)],
    [complex(2, 3), complex(2, 4)],
  ];
  const colorsBuffer: paper.Color[] = [];
  return {
    id: 1,
    inputValues: [],
    inputDrawingPoints: [],
    inputSimplifyTolerance: SIMPLIFY_INITIAL,
    inputSimplifyEnabled: true,
    solvers: seeds.map((xSeed) => ({
      xSeed,
      color: getNextColorWithBuffer(colorsBuffer).toCSS(true),
      ouputValues: undefined,
      ouputValuesValid: false,
    })),
    ...sheet,
  };
}

export const solveAllInQArray = createAsyncThunk(
  'app/solveInQArray',
  async ({
    allXSeeds,
    inputValues,
    config,
  }: {
    allXSeeds: Array<Complex[]>;
    inputValues: Complex[];
    config: CalcConfig;
  }): Promise<ResultInQArray[]> => {
    const workers = allXSeeds.map((xSeed) => {
      const calcWorkerInstance = calcWorker();
      return calcWorkerInstance.solveInQArray(xSeed, inputValues, config);
    });

    const results = (await Promise.all(workers)) as ResultInQArray[];
    return results;
  }
);

const sheetAdapter = createEntityAdapter<Sheet>();

const initialState: AppState = {
  solvingInProgress: false,
  sheets: sheetAdapter.getInitialState({
    ids: [1],
    entities: { 1: buildInitialSheet({ id: 1 }) },
  }),
  activeSheetId: 1,
  inputZoom: 1,
  outputZoom: 1,
  outputProjectionVariant: OutputProjectionVariant.V1,
  calcConfig: {
    Ex: {
      E1: complex(2),
      E2: complex(3),
      E3: complex(-5),
    },
    Ax: {
      AL: [complex(6), complex(5)],
      AR: [complex(3), complex(2)],
    },
  },
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

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    calculateAllOutputPaths: (state) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) return;

      activeSheet.solvers.forEach((solver) => {
        const ouptputValues = solveInQArray(
          solver.xSeed,
          activeSheet.inputValues,
          state.calcConfig
        );
        solver.ouputValues = ouptputValues;
        solver.calculatedXSeed = {
          start: solver.ouputValues.map((output) => output[0]),
          end: solver.ouputValues.map((output) => output[output.length - 1]),
        };
        solver.ouputValuesValid = true;
      });
      // console.log(
      //   stringifyForMathematica(
      //     state.sheets[state.activeSheetIndex].inputValues
      //   )
      // );
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
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) return;

      sheetAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          inputValues: [],
          inputDrawingPoints: [],
          // TODO update solvers with entity adapter
          solvers: activeSheet.solvers.map((solver) => ({
            ...solver,
            ouputValues: [],
            ouputValuesValid: false,
            calculatedXSeed: undefined,
          })),
        },
      });
    },

    setInputValues: (state, action: PayloadAction<Complex[]>) => {
      sheetAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          inputValues: action.payload,
        },
      });
    },

    setXSeedsValues: (state, action: PayloadAction<XSeedValue[]>) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) return;

      // optimized to not re-render if the values are the same and the ouput is valid
      const payloadXSeedsValues = action.payload;
      const prevXSeedsValues = activeSheet.solvers.map(
        (solver) => solver.xSeed
      );

      // only continue if there's any change in the xSeeds values
      if (!equal(payloadXSeedsValues, prevXSeedsValues)) {
        const colorsBuffer = activeSheet.solvers
          .slice(0, payloadXSeedsValues.length)
          .map((solver) => new Paper.Color(solver.color));
        const prevSolvers = activeSheet.solvers;

        sheetAdapter.updateOne(state.sheets, {
          id: state.activeSheetId,
          changes: {
            solvers: payloadXSeedsValues.map(
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
            ),
          },
        });
      }
    },

    setXSeedsM: (state, action: PayloadAction<number>) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) return;

      const M = action.payload;
      const previousXSeedsValues = activeSheet.solvers.map(
        (solver) => solver.xSeed
      );
      if (previousXSeedsValues[0].length < M) {
        activeSheet.solvers.forEach((solver) => {
          solver.xSeed = [
            ...solver.xSeed,
            ...new Array(M - solver.xSeed.length)
              .fill(null)
              .map((_) => getRandomXSeedNumber()),
          ];
          solver.calculatedXSeed = undefined;
        });
      } else if (previousXSeedsValues[0].length > M) {
        activeSheet.solvers.forEach((solver) => {
          solver.xSeed = solver.xSeed.slice(0, M);
          solver.calculatedXSeed = undefined;
        });
      }
    },

    addXSeed: (state) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) return;

      const M = activeSheet.solvers[0].xSeed.length;
      const previousColors = activeSheet.solvers.map(
        (solver) => new Paper.Color(solver.color)
      );

      activeSheet.solvers.push({
        xSeed: new Array(M).fill(null).map(() => getRandomXSeedNumber()),
        color: getDifferentColor(previousColors).toCSS(true),
        ouputValues: undefined,
        ouputValuesValid: false,
      });
    },

    removeXSeedWithIndex: (state, action: PayloadAction<number>) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) return;

      const index = action.payload;
      if (activeSheet.solvers.length > 1) {
        activeSheet.solvers = activeSheet.solvers.filter(
          (_, solverIndex) => solverIndex !== index
        );
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
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) return;

      const { solverIndex, xSeedNumberIndex, xSeedNumberPartIndex, value } =
        action.payload;

      activeSheet.solvers[solverIndex].ouputValuesValid = false;
      activeSheet.solvers[solverIndex].xSeed[xSeedNumberIndex][
        xSeedNumberPartIndex
      ] = value;
      activeSheet.solvers[solverIndex].calculatedXSeed = undefined;
    },

    setSolverColor: (
      state,
      action: PayloadAction<{
        solverIndex: number;
        color: string;
      }>
    ) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) return;

      const { solverIndex, color } = action.payload;
      activeSheet.solvers[solverIndex].color = color;
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
      const lastSheetId = Number(state.sheets.ids[state.sheets.ids.length - 1]);
      const lastSheetSolvers = state.sheets.entities[lastSheetId]?.solvers;

      const newSheetId = lastSheetId + 1;

      const newSheet = buildInitialSheet({
        id: newSheetId,
        solvers: lastSheetSolvers?.map((lastSheetSolver) => ({
          ouputValues: undefined,
          ouputValuesValid: false,
          color: lastSheetSolver.color,
          xSeed:
            lastSheetSolver.ouputValues && lastSheetSolver.ouputValuesValid
              ? lastSheetSolver.ouputValues.map(
                  (output) => output[output.length - 1]
                )
              : lastSheetSolver.xSeed,
        })),
      });

      sheetAdapter.addOne(state.sheets, newSheet);

      state.activeSheetId = newSheetId;
    },

    setActiveSheetId: (state, action: PayloadAction<number>) => {
      state.activeSheetId = action.payload;
    },

    removeSheetWithId: (state, action: PayloadAction<number>) => {
      const removedSheetId = action.payload;
      const activeSheetIndex = state.sheets.ids.indexOf(state.activeSheetId);

      if (state.activeSheetId === removedSheetId) {
        state.activeSheetId =
          state.sheets.ids[activeSheetIndex - 1] ??
          state.sheets.ids[activeSheetIndex + 1];
      }

      sheetAdapter.removeOne(state.sheets, removedSheetId);
    },

    addInputDrawingPoint: (state, action: PayloadAction<StoredPoint>) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) return;
      activeSheet.inputDrawingPoints.push(action.payload);
    },

    setInputSimplifyTolerance: (state, action: PayloadAction<number>) => {
      sheetAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: { inputSimplifyTolerance: action.payload },
      });
    },

    setInputSimplifyEnabled: (state, action: PayloadAction<boolean>) => {
      sheetAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: { inputSimplifyEnabled: action.payload },
      });
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

  extraReducers: (builder) => {
    builder.addCase(solveAllInQArray.pending, (state) => {
      state.solvingInProgress = true;
    });
    builder.addCase(solveAllInQArray.rejected, (state, action) => {
      state.solvingInProgress = false;
      console.log(action);
    });
    builder.addCase(solveAllInQArray.fulfilled, (state, action) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) return;

      state.solvingInProgress = false;

      // map calculation results back to the solvers
      const allOuptputValues = action.payload;

      allOuptputValues.forEach((ouptputValues, ouptputValuesIndex) => {
        const solver = activeSheet.solvers[ouptputValuesIndex];
        solver.ouputValues = ouptputValues;
        solver.calculatedXSeed = {
          start: solver.ouputValues.map((output) => output[0]),
          end: solver.ouputValues.map((output) => output[output.length - 1]),
        };
        solver.ouputValuesValid = true;
      });
      console.log(stringifyForMathematica(activeSheet.inputValues));
      // console.log(
      //   JSON.stringify(
      //     nextState.sheets[nextState.activeSheetIndex].solvers.map(
      //       (solver) => solver.ouputValues
      //     )
      //   )
      //     .replaceAll("[", "{")
      //     .replaceAll("]", "}")
      // );
    });
  },
});

// Selectors
export const selectSolvingInprogress = (state: RootState) =>
  state.app.solvingInProgress;

export const selectBadPoints = (state: RootState) => state.app.badPoints;

export const selectCalcConfig = (state: RootState) => state.app.calcConfig;
export const selectN = (state: RootState) => state.app.calcConfig.Ax.AL.length;

export const selectInputZoom = (state: RootState) => state.app.inputZoom;
export const selectOutputZoom = (state: RootState) => state.app.outputZoom;
export const selectOutputProjectionVariant = (state: RootState) =>
  state.app.outputProjectionVariant;
export const selectActiveSheetId = (state: RootState) =>
  state.app.activeSheetId;
export const selectSheetIds = (state: RootState) => state.app.sheets.ids;

export const selectActiveSheet = (state: RootState) =>
  state.app.sheets.entities[state.app.activeSheetId] as Sheet;

export const selectPreviousSheet = (state: RootState) => {
  const activeSheetId = state.app.activeSheetId;
  const activeSheetIndex = state.app.sheets.ids.indexOf(activeSheetId);
  const previousSheetId = state.app.sheets.ids[activeSheetIndex - 1];
  return state.app.sheets.entities[previousSheetId];
};

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
  clearActiveSheetInputOuputValues,
  removeSheetWithId,
  removeXSeedWithIndex,
  setActiveSheetId,
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
