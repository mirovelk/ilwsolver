import { removeXSeedIdFromActiveSheet } from '../features/sheets/sheetsSlice';
import { removeXSeed, XSeedId } from '../features/xSeeds/xSeedsSlice';
import { AppThunk } from '../store';

export const removeXSeedFromActiveSheet =
  (xSeedId: XSeedId): AppThunk =>
  (dispatch) => {
    dispatch(removeXSeedIdFromActiveSheet(xSeedId));
    dispatch(removeXSeed(xSeedId));
  };
