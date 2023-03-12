import {
  OutputProjectionVariant,
  setOutputProjectionVariant,
} from '../features/results/resultsSlice';
import { selectActiveSheetStageIds } from '../features/sheets/sheetsSlice';
import { centerStageDataLayerOnValues } from '../features/stages/stagesSlice';
import { selectActiveSheetProjectedResults } from '../selectors/selectActiveSheetReuslts';
import { AppThunk } from '../store';

export const setProjectionVariantAndCenterActiveSheetResults =
  (outputProjectionVariant: OutputProjectionVariant): AppThunk =>
  (dispatch, getState) => {
    dispatch(setOutputProjectionVariant(outputProjectionVariant));

    const state = getState();

    const activeSheetProjectedResults =
      selectActiveSheetProjectedResults(state);

    const { outputStageId } = selectActiveSheetStageIds(state);

    const projectedValues = activeSheetProjectedResults.flatMap(
      (result) => result.values
    );

    dispatch(
      centerStageDataLayerOnValues({
        id: outputStageId,
        values: projectedValues,
      })
    );
  };
