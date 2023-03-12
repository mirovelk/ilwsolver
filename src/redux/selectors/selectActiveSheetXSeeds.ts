import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { selectActiveSheet } from './selectActiveSheet';

export const selectActiveSheetXSeeds = createSelector(
  [selectActiveSheet, (state: RootState) => state.xSeeds],
  (activeSheet, xSeeds) =>
    activeSheet.xSeedIds.map((xSeedId) => {
      const xSeed = xSeeds.entities[xSeedId]; // TODO use selector
      if (!xSeed) throw new Error('xSeed not found');
      return xSeed;
    })
);
