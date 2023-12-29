import {
  OutputProjectionVariant,
  setOutputProjectionVariant,
} from 'redux/features/results/resultsSlice';
import { centerStageDataLayerOnValues } from 'redux/features/stages/stagesSlice';
import { selectActiveSheetOutputStageId } from 'redux/features/sheets/sheetsSlice';
import { selectActiveSheetProjectedResults } from 'redux/selectors/selectActiveSheetReuslts';
import { AppThunk } from 'redux/store';

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
