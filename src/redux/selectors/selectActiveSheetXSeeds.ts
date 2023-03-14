import { createSelector } from '@reduxjs/toolkit';
import { required } from '../../util/required';
import { RootState } from '../store';
import { selectActiveSheet } from './selectActiveSheet';

export const selectActiveSheetXSeeds = createSelector(
  [selectActiveSheet, (state: RootState) => state.xSeeds],
  (activeSheet, xSeeds) =>
    activeSheet.xSeedIds.map((xSeedId) => required(xSeeds.entities[xSeedId]))
);