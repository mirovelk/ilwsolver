import { selectActiveSheetXSeeds } from '../../../selectors/selectActiveSheetXSeeds';
import { AppThunk } from '../../../store';
import { invalidateResultsForXSeeds } from '../../xSeeds/xSeedsSlice';

import { startDrawing } from '../sheetInputDrawingSlice';

export const invalidateActiveSheetXSeedsAndStartDrawing =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();

    const activeSheetXSeeds = selectActiveSheetXSeeds(state);

    dispatch(
      invalidateResultsForXSeeds(activeSheetXSeeds.map((xSeed) => xSeed.id))
    );

    dispatch(startDrawing());
  };
