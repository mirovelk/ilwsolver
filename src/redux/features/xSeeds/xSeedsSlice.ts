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
import { clearInputOutputValues } from '../../actions';
import { RootState } from '../../store';
import { solveActiveSheet } from '../ilwSolver/solveActiveSheet';
import { ResultId } from '../results/resultsSlice';

function getRandomXSeedPartNumber(): number {
  return getRandomNumberBetween(-10, 10);
}

export function getRandomXSeedNumber(): Complex {
  return [getRandomXSeedPartNumber(), getRandomXSeedPartNumber()];
}

export type XSeedId = EntityId;

export type XSeedValue = Complex[];

export interface XSeed {
  id: XSeedId;
  value: XSeedValue;
  color: string;
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
    color: 'rgb(0, 127, 255)',
    ...defaultXSeedProperties,
  },
  {
    id: uuidv4(),
    value: [complex(2, 3), complex(2, 4)],
    color: 'rgb(255, 127, 0)',
    ...defaultXSeedProperties,
  },
];

const xSeedsAdapter = createEntityAdapter<XSeed>();

const emptyInitialState = xSeedsAdapter.getInitialState();
const filledInitialState = xSeedsAdapter.upsertMany(
  emptyInitialState,
  initialXSeeds
);

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

    addXSeed: (
      state,
      action: PayloadAction<{ id: XSeedId; color: string; value: XSeedValue }>
    ) => {
      xSeedsAdapter.addOne(state, {
        ...action.payload,
        ...defaultXSeedProperties,
      });
    },

    addXSeeeds: (
      state,
      action: PayloadAction<{ id: XSeedId; color: string; value: XSeedValue }[]>
    ) => {
      xSeedsAdapter.addMany(
        state,
        action.payload.map((xSeed) => ({ ...xSeed, ...defaultXSeedProperties }))
      );
    },

    removeXSeed: (state, action: PayloadAction<XSeedId>) => {
      xSeedsAdapter.removeOne(state, action.payload);
    },

    removeXSeeds: (state, action: PayloadAction<XSeedId[]>) => {
      xSeedsAdapter.removeMany(state, action.payload);
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

    setXSeedColor: (
      state,
      action: PayloadAction<{
        xSeedId: XSeedId;
        color: string;
      }>
    ) => {
      const { xSeedId, color } = action.payload;

      const xSeed = state.entities[xSeedId];
      if (!xSeed) throw new Error('xSeed not found');

      xSeed.color = color;
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
  },
});

// Selectors
export const {
  selectAll: selectAllXSeeds,
  selectEntities: selectXSeedsEntities,
  selectById: selectXSeedById,
} = xSeedsAdapter.getSelectors((state: RootState) => state.xSeeds);

export const selectM = (state: RootState) => {
  const firstXSeed = state.xSeeds.entities[state.xSeeds.ids[0]];
  if (!firstXSeed) throw new Error('No xSeeds found');
  return firstXSeed.value.length;
};

const { actions, reducer } = xSeedsSlice;

export const {
  setXSeedsM,
  addXSeed,
  addXSeeeds,
  removeXSeed,
  removeXSeeds,
  setXSeedColor,
  setXSeedNumber,
  xSeedHasError,
  invalidateResultsForXSeeds,
} = actions;

export default reducer;
