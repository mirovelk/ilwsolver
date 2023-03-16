import { createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import { selectActiveSheetXSeeds } from '../../selectors/selectActiveSheetXSeeds';
import { AppDispatch, RootState } from '../../store';
import { Result, ResultId } from '../results/resultsSlice';
import {
  selectActiveSheetOutputStageId,
  selectActiveSheetQArray,
} from '../sheets/sheetsSlice';
import { selectSolverConfig } from '../solverConfig/solverConfigSlice';
import { StageId } from '../stages/stagesSlice';
import { XSeedId } from '../xSeeds/xSeedsSlice';

// TODO try to remove workerize-loader and just add entry point
// @ts-ignore
import solveWorker from 'workerize-loader!../../../core/solve';
import { ResultsInQArray } from '../../../core/solve';

export const solveActiveSheet = createAsyncThunk<
  {
    outputStageId: StageId;
    oldResultIds: ResultId[];
    resultsByXSeed: Array<{
      xSeedId: XSeedId;
      results: Array<Pick<Result, 'id' | 'values'>>;
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

  const workers = activeSheetXSeeds.map((xSeed) => {
    const solveWorkerInstance = solveWorker(); // TODO use comlink
    return solveWorkerInstance.solveInQArray(
      xSeed.value,
      activeSheetQArray,
      solverConfig
    );
  });
  const allResults = (await Promise.all(workers)) as ResultsInQArray[];

  const outputStageId = selectActiveSheetOutputStageId(state);

  // TODO does not center on projected values!

  return {
    outputStageId: outputStageId,
    oldResultIds: activeSheetXSeeds.flatMap((xSeed) => xSeed.resultIds),
    resultsByXSeed: allResults.map((resultsInQArray, resultIndex) => ({
      xSeedId: activeSheetXSeeds[resultIndex].id,
      results: resultsInQArray.map((resultInQArray) => ({
        id: uuidv4(),
        values: resultInQArray,
      })),
    })),
  };
});
