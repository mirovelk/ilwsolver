import {
  ResultId,
  updateResultsSelection,
} from 'redux/features/results/resultsSlice';

import { selectActiveSheetXSeeds } from 'redux/selectors/selectActiveSheetXSeeds';
import { AppThunk } from 'redux/store';

export const activeSheetSelectSingleResult =
  (selectedResultId: ResultId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    const activeSheetXSeeds = selectActiveSheetXSeeds(state);

    const activeSheetReusltIds = activeSheetXSeeds.flatMap(
      (xSeed) => xSeed.resultIds
    );

    const activeSheetUnselectedResultIds = activeSheetReusltIds.filter(
      (resultId) => resultId !== selectedResultId
    );

    dispatch(
      updateResultsSelection({
        selected: [selectedResultId],
        unselected: activeSheetUnselectedResultIds,
      })
    );
  };
