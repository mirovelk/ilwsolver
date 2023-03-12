import { RootState } from '../store';

export const selectActiveSheet = (state: RootState) => {
  const activeSheet = state.sheets.entities[state.sheets.activeSheetId];
  if (!activeSheet) throw new Error('Sheet not found');
  return activeSheet;
};
