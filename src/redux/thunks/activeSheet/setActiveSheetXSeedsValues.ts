import { required } from 'util/required';
import { selectActiveSheetXSeedIds } from 'redux/features/sheets/sheetsSlice';
import {
  XSeedValue,
  removeXSeed,
  selectXSeedById,
  setXSeedValue,
} from 'redux/features/xSeeds/xSeedsSlice';
import { AppThunk } from 'redux/store';
import { addXSeedToActiveSheet } from './addXSeedToActiveSheet';

export const setActiveSheetXSeedsValues =
  (newXSeedValues: XSeedValue[]): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const activeSheetXSeedIds = selectActiveSheetXSeedIds(state);
    const xSeedIdsToUpdate = activeSheetXSeedIds.slice(
      0,
      newXSeedValues.length
    );
    const xSeedIdsToRemove = activeSheetXSeedIds.slice(newXSeedValues.length);
    const xSeedIdsToAdd = newXSeedValues.slice(xSeedIdsToUpdate.length);

    // update existing xSeeds
    xSeedIdsToUpdate.forEach((xSeedId, xSeedIdIndex) => {
      const xSeedValue = newXSeedValues[xSeedIdIndex];
      dispatch(setXSeedValue({ xSeedId, value: xSeedValue }));
    });

    // remove extra xSeeds if needed
    if (xSeedIdsToRemove.length > 0) {
      const sheetId = state.sheets.activeSheetId;
      xSeedIdsToRemove.forEach((xSeedId) => {
        const resultIds = required(selectXSeedById(state, xSeedId)).resultIds;
        dispatch(removeXSeed({ sheetId, resultIds, xSeedId }));
      });
    }

    // add new xSeeds if needed
    if (xSeedIdsToAdd.length > 0) {
      xSeedIdsToAdd.forEach((xSeedValue) => {
        dispatch(addXSeedToActiveSheet(xSeedValue));
      });
    }
  };
