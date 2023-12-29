import { addInputDrawingPoint } from 'redux/features/sheetInputDrawing/sheetInputDrawingSlice';
import { selectActiveSheetId } from 'redux/features/sheets/sheetsSlice';
import { AppThunk } from 'redux/store';

export const addActiveSheetInputDrawingPoint =
  (point: [number, number]): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    const activeSheetId = selectActiveSheetId(state);

    dispatch(
      addInputDrawingPoint({
        sheetId: activeSheetId,
        point,
      })
    );
  };
