import { required } from 'util/required';
import {
  removeSheet,
  selectSheetById,
  SheetId,
} from 'redux/features/sheets/sheetsSlice';
import { selectXSeedById } from 'redux/features/xSeeds/xSeedsSlice';
import { AppThunk } from 'redux/store';

export const removeSheetAndData =
  (removedSheetId: SheetId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const removedSheet = selectSheetById(state, removedSheetId);

    const removedResultIds = removedSheet.xSeedIds.flatMap((xSeedId) => {
      const xSeed = required(selectXSeedById(state, xSeedId));
      return xSeed.resultIds;
    });

    dispatch(
      removeSheet({
        sheetId: removedSheet.id,
        xSeedIds: removedSheet.xSeedIds,
        stageIds: [removedSheet.inputStageId, removedSheet.outputStageId],
        resultIds: removedResultIds,
      })
    );
  };
