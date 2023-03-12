import { createAction } from '@reduxjs/toolkit';
import { ResultId } from './features/results/resultsSlice';
import { SheetId } from './features/sheets/sheetsSlice';
import { StageId } from './features/stages/stagesSlice';
import { XSeedId } from './features/xSeeds/xSeedsSlice';

export const clearInputOutputValues = createAction<{
  sheetId: SheetId;
  stageIds: StageId[];
  xSeedIds: XSeedId[];
  resultIds: ResultId[];
}>('common/clearInputOutputValues');
