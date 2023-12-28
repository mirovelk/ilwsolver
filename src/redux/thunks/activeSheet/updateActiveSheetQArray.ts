import {
  selectActiveSheetId,
  updateSheetQArray,
} from '../../features/sheets/sheetsSlice';
import { selectActiveSheetInputDrawingPoints } from '../../selectors/selectActiveSheetInputDrawingPoints';
import { AppThunk } from '../../store';

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
