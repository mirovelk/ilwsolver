import { createSelector } from '@reduxjs/toolkit';
import { Complex } from '../../util/complex';
import { required } from '../../util/required';
import { selectResultsEntities } from '../features/results/resultsSlice';
import { XSeed } from '../features/xSeeds/xSeedsSlice';
import { selectActiveSheetXSeeds } from './selectActiveSheetXSeeds';

export const selectXSeedEditorData = createSelector(
  [selectActiveSheetXSeeds, selectResultsEntities],
  (
    activeSheetXSeeds,
    results
  ): {
    xSeedsRemovalDisabled: boolean;
    xSeeds: Array<
      Pick<XSeed, 'id' | 'color' | 'value' | 'resultsValid'> & {
        resultsStarts: Complex[];
        resultsEnds: Complex[];
      }
    >;
  } => {
    return {
      xSeedsRemovalDisabled: activeSheetXSeeds.length < 2,
      xSeeds: activeSheetXSeeds.map((xSeed) => ({
        id: xSeed.id,
        color: xSeed.color,
        value: xSeed.value,
        resultsValid: xSeed.resultsValid,
        resultsStarts: xSeed.resultIds.map(
          (resultId) => required(results[resultId]).values[0]
        ),
        resultsEnds: xSeed.resultIds.map((resultId) => {
          const xSeedResults = required(results[resultId]);
          return xSeedResults.values[xSeedResults.values.length - 1];
        }),
      })),
    };
  }
);
