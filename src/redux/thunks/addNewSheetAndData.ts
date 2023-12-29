import { v4 as uuidv4 } from 'uuid';
import { required } from 'util/required';
import { addSheet, selectLastSheet } from 'redux/features/sheets/sheetsSlice';
import { selectXSeedColor } from 'redux/features/xSeedColors/xSeedColorsSlice';
import { selectLastSheetXSeeds } from 'redux/selectors/selectLastSheetXSeeds';
import { AppThunk } from 'redux/store';

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
              const result = required(state.results.entities[resultId]);
              return result.values[result.values.length - 1];
            })
          : lastSheetXSeed.value,
    };
  });

  const inputStageId = uuidv4();
  const outputStageId = uuidv4();

  dispatch(
    addSheet({
      id: newSheetId,
      xSeeds: newSheetXSeeds,
      inputStageId,
      outputStageId,
    })
  );
};
