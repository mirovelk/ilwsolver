import { createSelector } from '@reduxjs/toolkit';
import { Complex } from '../../util/complex';
import { required } from '../../util/required';
import { selectResultsEntities } from '../features/results/resultsSlice';
import { selectActiveSheetXSeeds } from './selectActiveSheetXSeeds';

export const selectActiveSheetResultsStartEnd = createSelector(
  [selectActiveSheetXSeeds, selectResultsEntities],
  (
    activeSheetXSeeds,
    results
  ): {
    allXSeedsCalculated: boolean;
    allXSeedResultsStarts: Complex[][];
    allXSeedResultsEnds: Complex[][];
  } => {
    return {
      allXSeedsCalculated: activeSheetXSeeds.every(
        (xSeed) => xSeed.resultIds.length > 0
      ),
      allXSeedResultsStarts: activeSheetXSeeds.map((xSeed) =>
        xSeed.resultIds.map((resultId) => required(results[resultId]).values[0])
      ),
      allXSeedResultsEnds: activeSheetXSeeds.map((xSeed) => {
        return xSeed.resultIds.map((resultId) => {
          const xSeedResults = required(results[resultId]);
          return xSeedResults.values[xSeedResults.values.length - 1];
        });
      }),
    };
  }
);
