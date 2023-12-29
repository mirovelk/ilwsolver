import { createSelector } from '@reduxjs/toolkit';
import { selectActiveSheetId } from 'redux/features/sheets/sheetsSlice';
import { selectSheetDrawingPointsBySheetIdEntries } from 'redux/features/sheetInputDrawing/sheetInputDrawingSlice';

export const selectActiveSheetInputDrawingPoints = createSelector(
  [selectActiveSheetId, selectSheetDrawingPointsBySheetIdEntries],
  (activeSheetId, sheetDrawingPointsBySheetIdEntries) => {
    return sheetDrawingPointsBySheetIdEntries[activeSheetId]?.points ?? [];
  }
);
