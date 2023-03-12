import { createSelector } from '@reduxjs/toolkit';
import { selectActiveSheetProjectedResult } from '../features/results/resultsSlice';
import { RootState } from '../store';
import { selectActiveSheetResultIds } from './selectActiveSheetReusltIds';

export const selectActiveSheetProjectedResults = createSelector(
  [selectActiveSheetResultIds, (state: RootState) => state],
  (activeSheetResultIds, state) =>
    activeSheetResultIds.map((resultId) => {
      return selectActiveSheetProjectedResult(state, resultId);
    })
);
