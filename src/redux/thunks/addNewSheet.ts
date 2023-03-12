import { v4 as uuidv4 } from 'uuid';
import { addSheet, selectLastSheet } from '../features/sheets/sheetsSlice';
import { addStage } from '../features/stages/stagesSlice';
import { addXSeeeds } from '../features/xSeeds/xSeedsSlice';
import { selectLastSheetXSeeds } from '../selectors/selectLastSheetXSeeds';
import { AppThunk } from '../store';

export const addNewSheet = (): AppThunk => (dispatch, getState) => {
  const state = getState();

  const lastSheet = selectLastSheet(state);
  const lastSheetXSeeds = selectLastSheetXSeeds(state);

  const newSheetXSeeds = lastSheetXSeeds.map((lastSheetXSeed) => {
    return {
      id: uuidv4(),
      color: lastSheetXSeed.color,
      value:
        lastSheetXSeed.resultIds.length > 0 && lastSheetXSeed.resultsValid
          ? lastSheetXSeed.resultIds.map((resultId) => {
              const result = state.results.entities[resultId];
              if (!result) throw new Error('Result not found');
              return result.values[result.values.length - 1];
            })
          : lastSheetXSeed.value,
    };
  });

  const inputStageId = uuidv4();
  const outputStageId = uuidv4();

  const newSheet = {
    id: Number(lastSheet.id) + 1,
    xSeedIds: newSheetXSeeds.map((newSheetXSeed) => newSheetXSeed.id),
    inputStageId,
    outputStageId,
  };

  dispatch(addXSeeeds(newSheetXSeeds));
  dispatch(addStage({ id: inputStageId }));
  dispatch(addStage({ id: outputStageId }));
  dispatch(addSheet(newSheet));
};
