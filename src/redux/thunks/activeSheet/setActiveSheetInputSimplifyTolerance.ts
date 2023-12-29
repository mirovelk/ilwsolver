import {
  selectActiveSheetId,
  setInputSimplifyTolerance,
} from 'redux/features/sheets/sheetsSlice';
import { AppThunk } from 'redux/store';

export const setActiveSheetInputSimplifyTolerance =
  (inputSimplifyTolerance: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    const activeSheetId = selectActiveSheetId(state);

    dispatch(
      setInputSimplifyTolerance({
        sheetId: activeSheetId,
        inputSimplifyTolerance,
      })
    );
    // TODO invlaidate qArray and results
  };
