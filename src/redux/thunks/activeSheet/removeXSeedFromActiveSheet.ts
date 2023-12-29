import { required } from 'util/required';
import {
  removeXSeed,
  selectXSeedById,
  XSeedId,
} from 'redux/features/xSeeds/xSeedsSlice';
import { AppThunk } from 'redux/store';

export const removeXSeedFromActiveSheet =
  (xSeedId: XSeedId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const sheetId = state.sheets.activeSheetId;
    const resultIds = required(selectXSeedById(state, xSeedId)).resultIds;
    dispatch(removeXSeed({ sheetId, xSeedId, resultIds }));
  };
