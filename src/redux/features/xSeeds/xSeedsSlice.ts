import {
  createEntityAdapter,
  createSlice,
  EntityId,
  PayloadAction,
} from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import {
  complex,
  Complex,
  getRandomNumberBetween,
} from '../../../util/complex';
import { required } from '../../../util/required';
import { clearInputOutputValues } from '../../actions';
import { RootState } from '../../store';
import { solveActiveSheet } from '../ilwSolver/solveActiveSheet';
import { ResultId } from '../results/resultsSlice';
import { addSheet, removeSheet, SheetId } from '../sheets/sheetsSlice';

function getRandomXSeedPartNumber(): number {
  return getRandomNumberBetween(-10, 10);
}

export function getRandomXSeedNumber(): Complex {
  return [getRandomXSeedPartNumber(), getRandomXSeedPartNumber()];
}

export type XSeedId = EntityId;

export type XSeedValue = Complex[];

export interface AddXSeedPayload {
  sheetId: SheetId;
  xSeedId: XSeedId;
  color: string;
  value: XSeedValue;
}

export interface XSeed {
  id: XSeedId;
  value: XSeedValue;
  hasError: boolean;
  resultIds: ResultId[];
  resultsValid: boolean;
}

const defaultXSeedProperties = {
  hasError: false,
  resultIds: [],
  resultsValid: false,
};

export const initialXSeeds: XSeed[] = [
  {
    id: uuidv4(),
    value: [complex(2, -3), complex(3, -2)],
    ...defaultXSeedProperties,
  },
  {
    id: uuidv4(),
    value: [complex(2, 3), complex(2, 4)],
    ...defaultXSeedProperties,
  },
];

const xSeedsAdapter = createEntityAdapter<XSeed>(); // TODO group by sheetId?

const emptyInitialState = xSeedsAdapter.getInitialState();
const filledInitialState = xSeedsAdapter.upsertMany(
  emptyInitialState,
  initialXSeeds
);

// TODO change to xSeedValues slice
export const xSeedsSlice = createSlice({
  name: 'xSeeds',
  initialState: filledInitialState,
  reducers: {
    setXSeedsM: (state, action: PayloadAction<number>) => {
      const M = action.payload;

      const updates = state.ids.map((xSeedId) => {
        const xSeedValue = state.entities[xSeedId]?.value;
        if (!xSeedValue) throw new Error('xSeed not found');

        return {
          id: xSeedId,
          changes: {
            value:
              xSeedValue.length < M
                ? [
                    ...xSeedValue,
                    ...new Array(M - xSeedValue.length)
                      .fill(null)
                      .map((_) => getRandomXSeedNumber()),
                  ]
                : xSeedValue.slice(0, M),
            resultsValid: false,
          },
        };
      });
      xSeedsAdapter.updateMany(state, updates);
    },

    addXSeed: (state, action: PayloadAction<AddXSeedPayload>) => {
      const { xSeedId, value } = action.payload;
      xSeedsAdapter.addOne(state, {
        id: xSeedId,
        value,
        ...defaultXSeedProperties,
      });
    },

    removeXSeed: (
      state,
      action: PayloadAction<{
        sheetId: SheetId;
        xSeedId: XSeedId;
        resultIds: ResultId[];
      }>
    ) => {
      xSeedsAdapter.removeOne(state, action.payload.xSeedId);
    },

    setXSeedNumber: (
      state,
      action: PayloadAction<{
        xSeedId: XSeedId;
        xSeedNumberIndex: number;
        value: Complex;
      }>
    ) => {
      const { xSeedId, xSeedNumberIndex, value } = action.payload;

      const xSeed = state.entities[xSeedId];
      if (!xSeed) throw new Error('xSeed not found');

      xSeed.value[xSeedNumberIndex] = value;
    },

    xSeedHasError(
      state,
      action: PayloadAction<{ xSeedId: XSeedId; hasError: boolean }>
    ) {
      const { xSeedId, hasError } = action.payload;
      const xSeed = state.entities[xSeedId];
      if (!xSeed) throw new Error('xSeed not found');
      xSeed.hasError = hasError;
    },

    invalidateResultsForXSeeds(state, action: PayloadAction<Array<XSeedId>>) {
      const xSeedIds = action.payload;
      xSeedIds.forEach((xSeedId) => {
        const xSeed = state.entities[xSeedId];
        if (!xSeed) throw new Error('xSeed not found');
        xSeed.resultsValid = false;
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(solveActiveSheet.fulfilled, (state, action) => {
      const { resultsByXSeed } = action.payload;

      xSeedsAdapter.updateMany(state, [
        ...resultsByXSeed.map((xSeedResults) => ({
          id: xSeedResults.xSeedId,
          changes: {
            resultIds: xSeedResults.results.map((result) => result.id),
            resultsValid: true,
          },
        })),
      ]);
    });
    builder.addCase(clearInputOutputValues, (state, action) => {
      const { xSeedIds } = action.payload;
      xSeedIds.forEach((xSeedId) => {
        const xSeed = state.entities[xSeedId];
        if (!xSeed) throw new Error('xSeed not found');
        xSeed.resultIds = [];
        xSeed.resultsValid = false;
      });
    });
    builder.addCase(addSheet, (state, action) => {
      const { xSeeds } = action.payload;
      xSeeds.forEach((xSeed) => {
        xSeedsSlice.caseReducers.addXSeed(
          state,
          xSeedsSlice.actions.addXSeed(xSeed)
        );
      });
    });
    builder.addCase(removeSheet, (state, action) => {
      const { sheetId, xSeedIds, resultIds } = action.payload;
      xSeedIds.forEach((xSeedId) => {
        xSeedsSlice.caseReducers.removeXSeed(
          state,
          xSeedsSlice.actions.removeXSeed({
            sheetId,
            xSeedId,
            resultIds,
          })
        );
      });
    });
  },
});

// Selectors
export const {
  selectAll: selectAllXSeeds,
  selectEntities: selectXSeedsEntities,
  selectById: selectXSeedById,
} = xSeedsAdapter.getSelectors((state: RootState) => state.xSeeds);

export const selectM = (state: RootState) => {
  const firstXSeed = required(state.xSeeds.entities[state.xSeeds.ids[0]]);
  return firstXSeed.value.length;
};

export const xSeedValueSelector = (state: RootState, xSeedId: XSeedId) =>
  required(selectXSeedById(state, xSeedId)).value;

const { actions, reducer } = xSeedsSlice;

export const {
  setXSeedsM,
  addXSeed,
  removeXSeed,
  setXSeedNumber,
  xSeedHasError,
  invalidateResultsForXSeeds,
} = actions;

export default reducer;
