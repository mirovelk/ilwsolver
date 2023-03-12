import { createSelector } from '@reduxjs/toolkit';
import { selectActiveSheetXSeeds } from './selectActiveSheetXSeeds';

export const selectActiveSheetResultIds = createSelector(
  [selectActiveSheetXSeeds],
  (activeSheetXSeeds) => activeSheetXSeeds.flatMap((xSeed) => xSeed.resultIds)
);
