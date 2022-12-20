import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import Paper from 'paper';
import { v4 as uuidv4 } from 'uuid';

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
import { RootState } from '../../store';
import {
  AppState,
  OutputProjectionVariant,
  Sheet,
  Solver,
  SolverId,
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
  return {
    id: 1,
    inputValues: [],
    inputDrawingPoints: [],
    inputSimplifyTolerance: SIMPLIFY_INITIAL,
    inputSimplifyEnabled: true,
    solvers: [],
    ...sheet,
  };
}

export const solveAllInQArray = createAsyncThunk(
  'app/solveInQArray',
  async ({
    solvers,
    inputValues,
    config,
  }: {
    solvers: Solver[];
    inputValues: Complex[];
    config: CalcConfig;
  }): Promise<
    Array<{
      solverId: SolverId;
      result: ResultInQArray;
    }>
  > => {
    const workers = solvers.map((solver) => {
      const calcWorkerInstance = calcWorker();
      return calcWorkerInstance.solveInQArray(
        solver.xSeed,
        inputValues,
        config
      );
    });
    const results = (await Promise.all(workers)) as ResultInQArray[];
    return results.map((result, resultIndex) => ({
      solverId: solvers[resultIndex].id,
      result,
    }));
  }
);

const sheetsAdapter = createEntityAdapter<Sheet>();
const solversAdapter = createEntityAdapter<Solver>();

const initialState: AppState = {
  sheets: sheetsAdapter.getInitialState({
    ids: [1],
    entities: { 1: buildInitialSheet({ id: 1, solvers: [0, 1] }) },
  }),
  solvers: solversAdapter.getInitialState({
    ids: [0, 1],
    entities: {
      0: {
        id: 0,
        xSeed: [complex(2, -3), complex(3, -2)],
        color: 'rgb(0, 127, 255)',
        outputValues: undefined,
        outputValuesValid: false,
      },
      1: {
        id: 1,
        xSeed: [complex(2, 3), complex(2, 4)],
        color: 'rgb(255, 127, 0)',
        outputValues: undefined,
        outputValuesValid: false,
      },
    },
  }),
  solvingInProgress: false,
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
      if (!activeSheet) throw new Error('Sheet not found');

      const solverIds = activeSheet.solvers;

      const solverUpdates = solverIds.map((solverId) => {
        const xSeed = state.solvers.entities[solverId]?.xSeed;
        if (!xSeed) throw new Error('Solver not found');

        const outputValues = solveInQArray(
          xSeed,
          activeSheet.inputValues,
          state.calcConfig
        );

        return {
          id: solverId,
          changes: {
            outputValues,
            outputValuesValid: true,
          },
        };
      });

      solversAdapter.updateMany(state.solvers, solverUpdates);
    },

    clearActiveSheetInputOutputValues: (state) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          inputValues: [],
          inputDrawingPoints: [],
        },
      });

      const solverIds = activeSheet.solvers;
      solversAdapter.updateMany(
        state.solvers,
        solverIds.map((solverId) => ({
          id: solverId,
          changes: {
            outputValues: [],
            outputValuesValid: false,
          },
        }))
      );
    },

    setInputValues: (state, action: PayloadAction<Complex[]>) => {
      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          inputValues: action.payload,
        },
      });
    },

    setXSeedsValues: (state, action: PayloadAction<XSeedValue[]>) => {
      // optimized to not re-render if the values are the same and the ouput is valid
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      const payloadXSeedsValues = action.payload;
      const solverIds = activeSheet.solvers;

      // update (or remove) existing solvers
      solverIds.forEach((solverId, solverIdIndex) => {
        if (solverIdIndex < payloadXSeedsValues.length) {
          const solver = state.solvers.entities[solverId];
          if (!solver) throw new Error('Solver not found');
          const newXSeed = payloadXSeedsValues[solverIdIndex];
          solversAdapter.updateOne(state.solvers, {
            id: solverId,
            changes: {
              xSeed: newXSeed,
              outputValuesValid: false,
            },
          });
        } else {
          // if there's more solvers than xSeeds in payload, remove the extra solvers
          solversAdapter.removeOne(state.solvers, solverId);
          sheetsAdapter.updateOne(state.sheets, {
            id: state.activeSheetId,
            changes: {
              solvers: activeSheet.solvers.filter((id) => id !== solverId),
            },
          });
        }
      });

      // add new solvers if there's more xSeeds in payload than solvers
      const newXSeeds = payloadXSeedsValues.slice(solverIds.length);
      if (newXSeeds.length > 0) {
        // fill the colors buffer with the colors of the existing solvers
        const colorsBuffer = solverIds.map((solverId) => {
          const color = state.solvers.entities[solverId]?.color;
          if (!color) throw new Error('Solver not found');
          return new Paper.Color(color);
        });

        const newSolvers = newXSeeds.map((newXSeed) => ({
          id: uuidv4(),
          xSeed: newXSeed,
          outputValuesValid: false,
          color: getNextColorWithBuffer(colorsBuffer).toCSS(true),
        }));

        solversAdapter.addMany(state.solvers, newSolvers);

        sheetsAdapter.updateOne(state.sheets, {
          id: state.activeSheetId,
          changes: {
            solvers: [...solverIds, ...newSolvers.map((solver) => solver.id)],
          },
        });
      }
    },

    setXSeedsM: (state, action: PayloadAction<number>) => {
      // TODO move UI to the global settings
      const M = action.payload;

      const updates = state.solvers.ids.map((solverId) => {
        const xSeed = state.solvers.entities[solverId]?.xSeed;
        if (!xSeed) throw new Error('Solver not found');

        return {
          id: solverId,
          changes: {
            xSeed:
              xSeed.length < M
                ? [
                    ...xSeed,
                    ...new Array(M - xSeed.length)
                      .fill(null)
                      .map((_) => getRandomXSeedNumber()),
                  ]
                : xSeed.slice(0, M),
            outputValuesValid: false,
            outputValues: undefined,
          },
        };
      });
      solversAdapter.updateMany(state.solvers, updates);
    },

    addSolverToActiveSheet: (state) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      const solverIds = activeSheet.solvers;
      const solvers = solverIds.map((solverId) => {
        const solver = state.solvers.entities[solverId];
        if (!solver) throw new Error('Solver not found');
        return solver;
      });

      const M = solvers[0].xSeed.length;

      const previousColors = solvers.map(
        (solvers) => new Paper.Color(solvers.color)
      );

      const newSolver = {
        id: uuidv4(),
        xSeed: new Array(M).fill(null).map(() => getRandomXSeedNumber()),
        color: getDifferentColor(previousColors).toCSS(true),
        outputValues: undefined,
        outputValuesValid: false,
      };

      solversAdapter.addOne(state.solvers, newSolver);
      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          solvers: [...solverIds, newSolver.id],
        },
      });
    },

    removeSolverFromActiveSheet: (state, action: PayloadAction<SolverId>) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      const solverId = action.payload;

      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          solvers: activeSheet.solvers.filter((id) => id !== solverId),
        },
      });
      solversAdapter.removeOne(state.solvers, solverId);
    },

    setXSeedNumberPart: (
      state,
      action: PayloadAction<{
        solverId: SolverId;
        xSeedNumberIndex: number;
        xSeedNumberPartIndex: number;
        value: number;
      }>
    ) => {
      const { solverId, xSeedNumberIndex, xSeedNumberPartIndex, value } =
        action.payload;

      const draftXSeed = state.solvers.entities[solverId]?.xSeed;
      if (!draftXSeed) throw new Error('xSeed not found');

      draftXSeed[xSeedNumberIndex][xSeedNumberPartIndex] = value;

      const update = {
        id: solverId,
        changes: {
          xSeed: draftXSeed,
          outputValuesValid: false,
        },
      };

      solversAdapter.updateOne(state.solvers, update);
    },

    setSolverColor: (
      state,
      action: PayloadAction<{
        solverId: SolverId;
        color: string;
      }>
    ) => {
      const { solverId, color } = action.payload;

      const update = {
        id: solverId,
        changes: {
          color,
        },
      };

      solversAdapter.updateOne(state.solvers, update);
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
      const lastSheetSolverIds = state.sheets.entities[lastSheetId]?.solvers;
      if (!lastSheetSolverIds) throw new Error('Sheet not found');

      const newSheetId = lastSheetId + 1;

      const newSolvers = lastSheetSolverIds.map((lastSheetSolverId) => {
        const lastSheetSolver = state.solvers.entities[lastSheetSolverId];
        if (!lastSheetSolver) throw new Error('Solver not found');

        return {
          id: uuidv4(),
          outputValues: undefined,
          outputValuesValid: false,
          color: lastSheetSolver.color,
          xSeed:
            lastSheetSolver.outputValues && lastSheetSolver.outputValuesValid
              ? lastSheetSolver.outputValues.map(
                  (output) => output[output.length - 1]
                )
              : lastSheetSolver.xSeed,
        };
      });

      solversAdapter.addMany(state.solvers, newSolvers);

      const newSheet = buildInitialSheet({
        id: newSheetId,
        solvers: newSolvers?.map((solver) => solver.id),
      });

      sheetsAdapter.addOne(state.sheets, newSheet);

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

      sheetsAdapter.removeOne(state.sheets, removedSheetId);
    },

    addInputDrawingPoint: (state, action: PayloadAction<StoredPoint>) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');
      activeSheet.inputDrawingPoints.push(action.payload);
    },

    setInputSimplifyTolerance: (state, action: PayloadAction<number>) => {
      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: { inputSimplifyTolerance: action.payload },
      });
      const updates = state.solvers.ids.map((solverId) => ({
        id: solverId,
        changes: {
          outputValuesValid: false,
        },
      }));
      solversAdapter.updateMany(state.solvers, updates);
    },

    setInputSimplifyEnabled: (state, action: PayloadAction<boolean>) => {
      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: { inputSimplifyEnabled: action.payload },
      });
      const updates = state.solvers.ids.map((solverId) => ({
        id: solverId,
        changes: {
          outputValuesValid: false,
        },
      }));
      solversAdapter.updateMany(state.solvers, updates);
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
      const updates = state.solvers.ids.map((solverId) => ({
        id: solverId,
        changes: {
          outputValuesValid: false,
        },
      }));
      solversAdapter.updateMany(state.solvers, updates);
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
      const updates = state.solvers.ids.map((solverId) => ({
        id: solverId,
        changes: {
          outputValuesValid: false,
        },
      }));
      solversAdapter.updateMany(state.solvers, updates);
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
      if (!activeSheet) throw new Error('Sheet not found');

      state.solvingInProgress = false;

      const allOutputValues = action.payload;

      const updates = allOutputValues.map(({ solverId, result }) => ({
        id: solverId,
        changes: {
          outputValues: result,
          outputValuesValid: true,
        },
      }));

      solversAdapter.updateMany(state.solvers, updates);
    });
  },
});

const solversSelectors = solversAdapter.getSelectors();

// Selectors
export const selectSolvingInprogress = (state: RootState) =>
  state.app.solvingInProgress;

export const selectBadPoints = (state: RootState) => state.app.badPoints;

export const selectCalcConfig = (state: RootState) => state.app.calcConfig;
export const selectN = (state: RootState) => state.app.calcConfig.Ax.AL.length;

export const selectM = (state: RootState) => {
  const firstSolver = state.app.solvers.entities[state.app.solvers.ids[0]];
  if (!firstSolver) throw new Error('No solvers found');
  return firstSolver.xSeed.length;
};

export const selectInputZoom = (state: RootState) => state.app.inputZoom;
export const selectOutputZoom = (state: RootState) => state.app.outputZoom;
export const selectOutputProjectionVariant = (state: RootState) =>
  state.app.outputProjectionVariant;
export const selectActiveSheetId = (state: RootState) =>
  state.app.activeSheetId;
export const selectSheetIds = (state: RootState) => state.app.sheets.ids;

export const selectActiveSheet = (state: RootState) => {
  const activeSheet = state.app.sheets.entities[state.app.activeSheetId];
  if (!activeSheet) throw new Error('Sheet not found');
  return activeSheet;
};
export const selectActiveSheetSolverIds = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.solvers
);

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
  [selectActiveSheetSolverIds, (state) => state.app.solvers],
  (activeSheetSolverIds, solvers) =>
    activeSheetSolverIds.map((solverId) => {
      const solver = solversSelectors.selectById(solvers, solverId);
      if (!solver) throw new Error('Solver not found');
      return solver;
    })
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
  addSolverToActiveSheet,
  clearActiveSheetInputOutputValues,
  removeSheetWithId,
  removeSolverFromActiveSheet,
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
