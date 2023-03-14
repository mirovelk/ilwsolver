import { RootState } from '../store';

// TODO move to sheets slice
export const selectActiveSheet = (state: RootState) => {
  const activeSheet = state.sheets.entities[state.sheets.activeSheetId];
  if (!activeSheet) throw new Error('Sheet not found');
  return activeSheet;
};
