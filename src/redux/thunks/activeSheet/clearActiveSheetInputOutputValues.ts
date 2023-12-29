import { clearInputOutputValues } from 'redux/actions';
import {
  selectActiveSheetId,
  selectActiveSheetInputStageId,
  selectActiveSheetOutputStageId,
} from 'redux/features/sheets/sheetsSlice';
import { selectActiveSheetXSeeds } from 'redux/selectors/selectActiveSheetXSeeds';
import { AppThunk } from 'redux/store';

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
