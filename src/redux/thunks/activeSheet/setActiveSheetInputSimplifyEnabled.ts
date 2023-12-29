import {
  selectActiveSheetId,
  setInputSimplifyEnabled,
} from 'redux/features/sheets/sheetsSlice';
import { AppThunk } from 'redux/store';

export const setActiveSheetInputSimplifyEnabled =
  (inputSimplifyEnabled: boolean): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    const activeSheetId = selectActiveSheetId(state);

    dispatch(
      setInputSimplifyEnabled({
        sheetId: activeSheetId,
        inputSimplifyEnabled,
      })
    );
    // TODO invlaidate qArray and results?
  };
