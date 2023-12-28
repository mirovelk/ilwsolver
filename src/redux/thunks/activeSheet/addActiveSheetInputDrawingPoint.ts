import { addInputDrawingPoint } from '../../features/sheetInputDrawing/sheetInputDrawingSlice';
import { selectActiveSheetId } from '../../features/sheets/sheetsSlice';
import { AppThunk } from '../../store';

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
