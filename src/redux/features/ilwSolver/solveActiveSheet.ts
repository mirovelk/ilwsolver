import { createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import * as Comlink from 'comlink';

import { selectActiveSheetXSeeds } from 'redux/selectors/selectActiveSheetXSeeds';
import { AppDispatch, RootState } from 'redux/store';
import { Result, ResultId } from 'redux/features/results/resultsSlice';
import {
  selectActiveSheetOutputStageId,
  selectActiveSheetQArray,
} from 'redux/features/sheets/sheetsSlice';
import { selectSolverConfig } from 'redux/features/solverConfig/solverConfigSlice';
import { StageId } from 'redux/features/stages/stagesSlice';
import { XSeedId } from 'redux/features/xSeeds/xSeedsSlice';
import { solveInQArray } from 'core/solve';

export const solveActiveSheet = createAsyncThunk<
  {
    outputStageId: StageId;
    oldResultIds: ResultId[];
    resultsByXSeed: Array<{
      xSeedId: XSeedId;
      results: Array<Pick<Result, 'id' | 'values'>>;
      error?: string;
    }>;
  },
  void,
  {
    state: RootState;
    dispatch: AppDispatch;
  }
>('app/solveActiveSheet', async (_, { getState }) => {
  const state = getState();

  const activeSheetQArray = selectActiveSheetQArray(state);
  const activeSheetXSeeds = selectActiveSheetXSeeds(state);
  const solverConfig = selectSolverConfig(state);

  const workers = activeSheetXSeeds.map((xSeed, xSeedIndex) => {
    const solveInQArrayWorker = new Worker(
      new URL('core/solve.worker', import.meta.url),
      {
        name: `solver-worker-${xSeedIndex}`,
        type: 'module',
      }
    );

    const solveInQArrayComlink =
      Comlink.wrap<typeof solveInQArray>(solveInQArrayWorker);

    return solveInQArrayComlink(xSeed.value, activeSheetQArray, solverConfig);
  });
  const allResults = await Promise.all(workers);

  const outputStageId = selectActiveSheetOutputStageId(state);

  // TODO does not center on projected values!

  return {
    outputStageId: outputStageId,
    oldResultIds: activeSheetXSeeds.flatMap((xSeed) => xSeed.resultIds),
    resultsByXSeed: allResults.map((resultsInQArray, resultIndex) => ({
      xSeedId: activeSheetXSeeds[resultIndex].id,
      results: resultsInQArray.results.map((resultInQArray) => ({
        id: uuidv4(),
        values: resultInQArray,
      })),
      error: resultsInQArray.error,
    })),
  };
});
