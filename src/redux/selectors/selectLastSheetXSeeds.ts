import { createSelector } from '@reduxjs/toolkit';
import { required } from 'util/required';
import { selectLastSheet } from 'redux/features/sheets/sheetsSlice';
import { selectXSeedsEntities } from 'redux/features/xSeeds/xSeedsSlice';

export const selectLastSheetXSeeds = createSelector(
  [selectLastSheet, selectXSeedsEntities],
  (lastSheet, xSeeds) =>
    lastSheet.xSeedIds.map((xSeedId) => required(xSeeds[xSeedId]))
);
