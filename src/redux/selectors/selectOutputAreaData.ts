import { createSelector } from '@reduxjs/toolkit';
import { Complex } from '../../util/complex';
import {
  Result,
  selectActiveSheetProjectedResult,
} from '../features/results/resultsSlice';
import { XSeed } from '../features/xSeeds/xSeedsSlice';
import { RootState } from '../store';
import { selectActiveSheetXSeeds } from './selectActiveSheetXSeeds';

export const selectActiveSheetOutputAreaData = createSelector(
  [selectActiveSheetXSeeds, (state: RootState) => state],
  (
    activeSheetXSeeds,
    state
  ): {
    xSeeds: Array<
      Pick<XSeed, 'id' | 'color' | 'resultsValid'> & {
        results: Array<
          Pick<Result, 'selected' | 'id'> & {
            projectedValues: Complex[];
          }
        >;
      }
    >;
  } => {
    return {
      xSeeds: activeSheetXSeeds.map((xSeed) => ({
        id: xSeed.id,
        color: xSeed.color,
        resultsValid: xSeed.resultsValid,
        results: xSeed.resultIds.map((resultId) => {
          const projectedResult = selectActiveSheetProjectedResult(
            state,
            resultId
          );
          return {
            id: resultId,
            selected: projectedResult.selected,
            projectedValues: projectedResult.values,
          };
        }),
      })),
    };
  }
);
