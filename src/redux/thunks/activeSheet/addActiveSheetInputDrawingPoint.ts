import {
  addInputDrawingPoint,
  selectActiveSheetId,
} from '../../features/sheets/sheetsSlice';
import { invalidateResultsForXSeeds } from '../../features/xSeeds/xSeedsSlice';
import { selectActiveSheetXSeeds } from '../../selectors/selectActiveSheetXSeeds';
import { AppThunk } from '../../store';

// TODO may not need to exist if activeSheetId is paased by props/dispatch
export const addActiveSheetInputDrawingPoint =
  (point: [number, number]): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    const activeSheetId = selectActiveSheetId(state);
    const activeSheetXSeeds = selectActiveSheetXSeeds(state);

    // TODO this is a performance hit, should be done once, not wiht every point
    dispatch(
      invalidateResultsForXSeeds(activeSheetXSeeds.map((xSeed) => xSeed.id))
    );

    dispatch(
      addInputDrawingPoint({
        sheetId: activeSheetId,
        point,
      })
    );
  };
