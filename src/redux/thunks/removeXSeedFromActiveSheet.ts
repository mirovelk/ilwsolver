import { removeXSeed, XSeedId } from '../features/xSeeds/xSeedsSlice';
import { AppThunk } from '../store';

export const removeXSeedFromActiveSheet =
  (xSeedId: XSeedId): AppThunk =>
  (dispatch, getState) => {
    const sheetId = getState().sheets.activeSheetId;
    dispatch(removeXSeed({ sheetId, xSeedId }));
  };
