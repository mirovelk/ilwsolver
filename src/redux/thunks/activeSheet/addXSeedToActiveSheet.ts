import { v4 as uuidv4 } from 'uuid';
import { getDifferentColor } from '../../../util/color';
import { selectXSeedsColors } from '../../features/xSeedColors/xSeedColorsSlice';
import {
  XSeedValue,
  addXSeed,
  getRandomXSeedNumber,
  selectM,
} from '../../features/xSeeds/xSeedsSlice';
import { selectActiveSheetXSeeds } from '../../selectors/selectActiveSheetXSeeds';
import { AppThunk } from '../../store';

export const addXSeedToActiveSheet =
  (xSeedValue?: XSeedValue): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const newXseedId = uuidv4();

    const activeSheetXSeeds = selectActiveSheetXSeeds(state);
    const M = selectM(state);

    const previousColors = selectXSeedsColors(
      state,
      activeSheetXSeeds.map((xSeed) => xSeed.id)
    );

    dispatch(
      addXSeed({
        sheetId: state.sheets.activeSheetId,
        xSeedId: newXseedId,
        value:
          xSeedValue ??
          new Array(M).fill(null).map(() => getRandomXSeedNumber()),
        color: getDifferentColor(previousColors),
      })
    );
  };
