import { createSelector } from '@reduxjs/toolkit';
import { selectActiveSheetId } from '../features/sheets/sheetsSlice';
import { selectSheetDrawingPointsBySheetIdEntries } from '../features/sheetInputDrawing/sheetInputDrawingSlice';

export const selectActiveSheetInputDrawingPoints = createSelector(
  [selectActiveSheetId, selectSheetDrawingPointsBySheetIdEntries],
  (activeSheetId, sheetDrawingPointsBySheetIdEntries) => {
    return sheetDrawingPointsBySheetIdEntries[activeSheetId]?.points ?? [];
  }
);
