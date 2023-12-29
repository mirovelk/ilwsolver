import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityId,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  add,
  Complex,
  complex,
  divide,
  multiply,
  subtract,
} from 'util/complex';
import { clearInputOutputValues } from 'redux/actions';

import { RootState } from 'redux/store';
import { solveActiveSheet } from 'redux/features/ilwSolver/solveActiveSheet';
import {
  removeSheet,
  selectActiveSheetQArray,
} from 'redux/features/sheets/sheetsSlice';
import { removeXSeed } from 'redux/features/xSeeds/xSeedsSlice';

function projectValueV2(x: Complex, q: Complex): Complex {
  return add(x, divide(complex(6), subtract(complex(1), q)));
}

function projectValueV3(x: Complex, q: Complex): Complex {
  return multiply(subtract(complex(1), q), x);
}

function valueToProjectedValue(
  x: Complex,
  q: Complex,
  projectionVariant: OutputProjectionVariant
): Complex {
  switch (projectionVariant) {
    case OutputProjectionVariant.V1:
      return x;
    case OutputProjectionVariant.V2:
      return projectValueV2(x, q);
    case OutputProjectionVariant.V3:
      return projectValueV3(x, q);
    default:
      return x;
  }
}

export enum OutputProjectionVariant {
  V1,
  V2,
  V3,
}

export type ResultId = EntityId;

export interface Result {
  id: ResultId;
  values: Complex[];
  selected: boolean;
  error?: string;
  // TODO move valid flag from xSeed result?
  // TODO copy q used for calculation to prevent crashes when q path changes
}

const resultsAdapter = createEntityAdapter<Result>();

export const resultsSlice = createSlice({
  name: 'results',
  initialState: resultsAdapter.getInitialState({
    outputProjectionVariant: OutputProjectionVariant.V1,
  }),
  reducers: {
    setOutputProjectionVariant: (
      state,
      action: PayloadAction<OutputProjectionVariant>
    ) => {
      state.outputProjectionVariant = action.payload;
    },

    toggleResultSelected(state, action: PayloadAction<{ resultId: ResultId }>) {
      const { resultId } = action.payload;
      resultsAdapter.updateOne(state, {
        id: resultId,
        changes: { selected: !state.entities?.[resultId]?.selected },
      });
    },

    updateResultsSelection(
      state,
      action: PayloadAction<{
        selected: ResultId[];
        unselected: ResultId[];
      }>
    ) {
      const { selected, unselected } = action.payload;

      resultsAdapter.updateMany(state, [
        ...selected.map((resultId) => ({
          id: resultId,
          changes: { selected: true },
        })),
        ...unselected.map((resultId) => ({
          id: resultId,
          changes: { selected: false },
        })),
      ]);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(solveActiveSheet.fulfilled, (state, action) => {
      const { resultsByXSeed, oldResultIds } = action.payload;

      resultsAdapter.removeMany(state, oldResultIds);

      resultsByXSeed.forEach((xSeedResults) => {
        resultsAdapter.addMany(
          state,
          xSeedResults.results.map((result) => ({
            ...result,
            selected: true,
          }))
        );
      });
    });
    builder.addCase(clearInputOutputValues, (state, action) => {
      const { resultIds } = action.payload;
      resultsAdapter.removeMany(state, resultIds);
    });
    builder.addCase(removeSheet, (state, action) => {
      const { resultIds } = action.payload;
      resultsAdapter.removeMany(state, resultIds);
    });
    builder.addCase(removeXSeed, (state, action) => {
      const { resultIds } = action.payload;
      resultsAdapter.removeMany(state, resultIds);
    });
  },
});

// Selectors

export const {
  selectById: selectResultById,
  selectEntities: selectResultsEntities,
} = resultsAdapter.getSelectors((state: RootState) => state.results);

export const selectOutputProjectionVariant = (state: RootState) =>
  state.results.outputProjectionVariant;

export const selectActiveSheetProjectedResult = createSelector(
  [
    (state: RootState, resultId: ResultId) => selectResultById(state, resultId),
    selectActiveSheetQArray,
    selectOutputProjectionVariant,
  ],

  (result, activeSheetQArray, outputProjectionVariant) => {
    if (!result) throw new Error('Result not found');
    return {
      ...result,
      values: result.values.map((value, valueIndex) =>
        valueToProjectedValue(
          value,
          activeSheetQArray[valueIndex],
          outputProjectionVariant
        )
      ),
    };
  }
);

const { actions, reducer } = resultsSlice;

export const {
  setOutputProjectionVariant,
  updateResultsSelection,
  toggleResultSelected,
} = actions;

export default reducer;
