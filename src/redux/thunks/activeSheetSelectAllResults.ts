import { updateResultsSelection } from '../features/results/resultsSlice';

import { selectActiveSheetXSeeds } from '../selectors/selectActiveSheetXSeeds';
import { AppThunk } from '../store';

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
