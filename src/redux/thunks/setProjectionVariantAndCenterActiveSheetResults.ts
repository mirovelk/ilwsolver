import {
  OutputProjectionVariant,
  setOutputProjectionVariant,
} from '../features/results/resultsSlice';
import { centerStageDataLayerOnValues } from '../features/stages/stagesSlice';
import { selectActiveSheetOutputStageId } from '../features/sheets/sheetsSlice';
import { selectActiveSheetProjectedResults } from '../selectors/selectActiveSheetReuslts';
import { AppThunk } from '../store';

export const setProjectionVariantAndCenterActiveSheetResults =
  (outputProjectionVariant: OutputProjectionVariant): AppThunk =>
  (dispatch, getState) => {
    dispatch(setOutputProjectionVariant(outputProjectionVariant));

    const state = getState();

    const activeSheetProjectedResults =
      selectActiveSheetProjectedResults(state);

    const outputStageId = selectActiveSheetOutputStageId(state);

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
