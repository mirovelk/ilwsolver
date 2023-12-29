import { createSelector } from '@reduxjs/toolkit';
import { selectActiveSheetProjectedResult } from 'redux/features/results/resultsSlice';
import { RootState } from 'redux/store';
import { selectActiveSheetResultIds } from './selectActiveSheetReusltIds';

export const selectActiveSheetProjectedResults = createSelector(
  [selectActiveSheetResultIds, (state: RootState) => state], // TODO do properly
  (activeSheetResultIds, state) =>
    activeSheetResultIds.map((resultId) => {
      return selectActiveSheetProjectedResult(state, resultId);
    })
);
