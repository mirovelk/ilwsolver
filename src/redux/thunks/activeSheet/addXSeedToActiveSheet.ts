import { v4 as uuidv4 } from 'uuid';
import { getDifferentColor } from 'util/color';
import { selectXSeedsColors } from 'redux/features/xSeedColors/xSeedColorsSlice';
import {
  XSeedValue,
  addXSeed,
  getRandomXSeedNumber,
  selectM,
} from 'redux/features/xSeeds/xSeedsSlice';
import { selectActiveSheetXSeeds } from 'redux/selectors/selectActiveSheetXSeeds';
import { AppThunk } from 'redux/store';

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
