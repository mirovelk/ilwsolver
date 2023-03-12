import {
  selectActiveSheetId,
  setInputSimplifyTolerance,
} from '../features/sheets/sheetsSlice';
import { AppThunk } from '../store';

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
