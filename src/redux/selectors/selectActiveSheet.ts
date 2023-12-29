import { required } from '../../util/required';
import { RootState } from '../store';

export const selectActiveSheet = (state: RootState) => {
  return required(state.sheets.entities[state.sheets.activeSheetId]);
};
