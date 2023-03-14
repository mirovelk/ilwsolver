import { v4 as uuidv4 } from 'uuid';
import { addSheet, selectLastSheet } from '../features/sheets/sheetsSlice';
import { selectXSeedColor } from '../features/xSeedColors/xSeedColorsSlice';
import { selectLastSheetXSeeds } from '../selectors/selectLastSheetXSeeds';
import { AppThunk } from '../store';

export const addNewSheetAndData = (): AppThunk => (dispatch, getState) => {
  const state = getState();

  const lastSheet = selectLastSheet(state);
  const lastSheetXSeeds = selectLastSheetXSeeds(state);

  const newSheetId = Number(lastSheet.id) + 1;

  const newSheetXSeeds = lastSheetXSeeds.map((lastSheetXSeed) => {
    return {
      sheetId: newSheetId,
      xSeedId: uuidv4(),
      color: selectXSeedColor(state, lastSheetXSeed.id),
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
    id: newSheetId,
    xSeeds: newSheetXSeeds,
    inputStageId,
    outputStageId,
  };

  dispatch(addSheet(newSheet));
};
