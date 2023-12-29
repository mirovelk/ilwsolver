import {
  selectActiveSheetId,
  setInputSimplifyEnabled,
} from '../../features/sheets/sheetsSlice';
import { AppThunk } from '../../store';

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
