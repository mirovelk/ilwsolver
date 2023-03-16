import { clearInputOutputValues } from '../actions';
import {
  selectActiveSheetId,
  selectActiveSheetInputStageId,
  selectActiveSheetOutputStageId,
} from '../features/sheets/sheetsSlice';
import { selectActiveSheetXSeeds } from '../selectors/selectActiveSheetXSeeds';
import { AppThunk } from '../store';

export const clearActiveSheetInputOutputValues =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();

    const activeSheetId = selectActiveSheetId(state);
    const inputStageId = selectActiveSheetInputStageId(state);
    const outputStageId = selectActiveSheetOutputStageId(state);
    const activeSheetXSeeds = selectActiveSheetXSeeds(state);

    dispatch(
      clearInputOutputValues({
        sheetId: activeSheetId,
        stageIds: [inputStageId, outputStageId],
        xSeedIds: activeSheetXSeeds.map((xSeed) => xSeed.id),
        resultIds: activeSheetXSeeds.flatMap((xSeed) => xSeed.resultIds),
      })
    );
  };
