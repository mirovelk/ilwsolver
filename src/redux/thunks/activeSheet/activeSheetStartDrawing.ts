import { selectActiveSheetXSeeds } from 'redux/selectors/selectActiveSheetXSeeds';
import { AppThunk } from 'redux/store';
import { invalidateResultsForXSeeds } from 'redux/features/xSeeds/xSeedsSlice';

import { startDrawing } from 'redux/features/sheetInputDrawing/sheetInputDrawingSlice';

export const invalidateActiveSheetXSeedsAndStartDrawing =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();

    const activeSheetXSeeds = selectActiveSheetXSeeds(state);

    dispatch(
      invalidateResultsForXSeeds(activeSheetXSeeds.map((xSeed) => xSeed.id))
    );

    dispatch(startDrawing());
  };
