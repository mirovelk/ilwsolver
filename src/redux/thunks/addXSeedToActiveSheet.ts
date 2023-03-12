import { v4 as uuidv4 } from 'uuid';
import { getDifferentColor } from '../../util/color';
import { addXSeedIdToActiveSheet } from '../features/sheets/sheetsSlice';
import {
  addXSeed,
  getRandomXSeedNumber,
  selectM,
} from '../features/xSeeds/xSeedsSlice';
import { selectActiveSheetXSeeds } from '../selectors/selectActiveSheetXSeeds';
import { AppThunk } from '../store';

export const addXSeedToActiveSheet = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const newXseedId = uuidv4();

  const activeSheetXSeeds = selectActiveSheetXSeeds(state);
  const M = selectM(state);

  const previousColors = activeSheetXSeeds.map((xSeed) => xSeed.color);

  dispatch(
    addXSeed({
      id: newXseedId,
      value: new Array(M).fill(null).map(() => getRandomXSeedNumber()),
      color: getDifferentColor(previousColors),
    })
  );
  dispatch(addXSeedIdToActiveSheet(newXseedId));
};
