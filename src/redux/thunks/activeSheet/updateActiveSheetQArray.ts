import {
  selectActiveSheetId,
  updateSheetQArray,
} from 'redux/features/sheets/sheetsSlice';
import { selectActiveSheetInputDrawingPoints } from 'redux/selectors/selectActiveSheetInputDrawingPoints';
import { AppThunk } from 'redux/store';

export const updateActiveSheetQArray = (): AppThunk => (dispatch, getState) => {
  const state = getState();

  const activeSheetId = selectActiveSheetId(state);
  const activeSheetInputDrawingPoints =
    selectActiveSheetInputDrawingPoints(state);

  dispatch(
    updateSheetQArray({
      sheetId: activeSheetId,
      inputDrawingPoints: activeSheetInputDrawingPoints,
    })
  );
};
