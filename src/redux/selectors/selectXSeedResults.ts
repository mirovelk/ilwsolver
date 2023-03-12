import { createSelector } from '@reduxjs/toolkit';
import { selectResultById } from '../features/results/resultsSlice';
import { selectXSeedById, XSeedId } from '../features/xSeeds/xSeedsSlice';
import { RootState } from '../store';

// TODO delete?
export const selectXSeedResults = createSelector(
  [
    (state: RootState, xSeedId: XSeedId) =>
      selectXSeedById(state.xSeeds, xSeedId),
    (state: RootState) => state,
  ],
  // TODO Use the result of selectXSeeds.selectById in the output selector
  (xSeed, state) => {
    if (!xSeed) throw new Error('xSeed not found');
    return xSeed.resultIds.map((resultId) => {
      const result = selectResultById(state, resultId); // TODO refactor to dependency?
      if (!result) throw new Error('result not found');
      return result;
    });
  }
);
