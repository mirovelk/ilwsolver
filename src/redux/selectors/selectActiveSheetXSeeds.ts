import { createSelector } from '@reduxjs/toolkit';
import { required } from 'util/required';
import { selectActiveSheet } from './selectActiveSheet';
import { selectXSeedsEntities } from 'redux/features/xSeeds/xSeedsSlice';

export const selectActiveSheetXSeeds = createSelector(
  [selectActiveSheet, selectXSeedsEntities],
  (activeSheet, xSeedsEntries) =>
    activeSheet.xSeedIds.map((xSeedId) => required(xSeedsEntries[xSeedId]))
);
