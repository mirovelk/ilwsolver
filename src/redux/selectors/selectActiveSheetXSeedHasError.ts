import { createSelector } from '@reduxjs/toolkit';
import { selectActiveSheetXSeeds } from './selectActiveSheetXSeeds';

export const selectActiveSheetXSeedHasError = createSelector(
  [selectActiveSheetXSeeds],
  (selectActiveSheetXSeeds) =>
    selectActiveSheetXSeeds.some((xSeed) => xSeed.hasError)
);
