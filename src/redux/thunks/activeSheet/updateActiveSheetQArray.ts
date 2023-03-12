import {
  selectActiveSheetId,
  updateSheetQArray,
} from '../../features/sheets/sheetsSlice';
import { AppThunk } from '../../store';

// TODO may not need to exist if activeSheetId is paased by props/dispatch
export const updateActiveSheetQArray = (): AppThunk => (dispatch, getState) => {
  const state = getState();

  const activeSheetId = selectActiveSheetId(state);

  dispatch(
    updateSheetQArray({
      sheetId: activeSheetId,
    })
  );
};
