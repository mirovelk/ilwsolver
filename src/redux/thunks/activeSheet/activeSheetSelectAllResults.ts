import { updateResultsSelection } from 'redux/features/results/resultsSlice';

import { selectActiveSheetXSeeds } from 'redux/selectors/selectActiveSheetXSeeds';
import { AppThunk } from 'redux/store';

export const activeSheetSelectAllResults =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();

    const activeSheetXSeeds = selectActiveSheetXSeeds(state);

    const activeSheetReusltIds = activeSheetXSeeds.flatMap(
      (xSeed) => xSeed.resultIds
    );

    dispatch(
      updateResultsSelection({
        selected: activeSheetReusltIds,
        unselected: [],
      })
    );
  };
