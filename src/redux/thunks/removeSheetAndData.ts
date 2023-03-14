import {
  removeSheet,
  selectSheetById,
  SheetId,
} from '../features/sheets/sheetsSlice';
import { removeStage } from '../features/stages/stagesSlice';
import { removeXSeed } from '../features/xSeeds/xSeedsSlice';
import { AppThunk } from '../store';

export const removeSheetAndData =
  (removedSheetId: SheetId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    const removedSheet = selectSheetById(state, removedSheetId);

    const removedInputStageId = removedSheet.inputStageId;
    const removedOutputStageId = removedSheet.outputStageId;
    const removedXSeedIds = [...removedSheet.xSeedIds];

    // TODO group into 1 removeSheet action
    removedXSeedIds.forEach((xSeedId) => {
      dispatch(removeXSeed({ sheetId: removedSheetId, xSeedId }));
    });
    dispatch(removeSheet(removedSheet.id));
    dispatch(removeStage({ id: removedInputStageId })); // TODO unify action args to objects or just ids
    dispatch(removeStage({ id: removedOutputStageId }));
  };
