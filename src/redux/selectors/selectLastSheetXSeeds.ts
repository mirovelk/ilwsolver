import { createSelector } from '@reduxjs/toolkit';
import { selectLastSheet } from '../features/sheets/sheetsSlice';
import { selectXSeedById } from '../features/xSeeds/xSeedsSlice';

export const selectLastSheetXSeeds = createSelector(
  [selectLastSheet, (state) => state.xSeeds],
  (lastSheet, xSeeds) =>
    lastSheet.xSeedIds.map((xSeedId) => {
      const xSeed = selectXSeedById(xSeeds, xSeedId);
      if (!xSeed) throw new Error('xSeed not found');
      return xSeed;
    })
);
