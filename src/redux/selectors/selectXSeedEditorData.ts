import { createSelector } from '@reduxjs/toolkit';
import { Complex } from '../../util/complex';
import { XSeed } from '../features/xSeeds/xSeedsSlice';
import { RootState } from '../store';
import { selectActiveSheetXSeeds } from './selectActiveSheetXSeeds';
import { selectXSeedResults } from './selectXSeedResults';

export const selectXSeedEditorData = createSelector(
  [selectActiveSheetXSeeds, (state: RootState) => state], // TODO do properly
  (
    activeSheetXSeeds,
    state
  ): {
    allXSeedsCalculated: boolean;
    xSeedsRemovalDisabled: boolean;
    xSeeds: Array<
      Pick<XSeed, 'id' | 'color' | 'value' | 'resultsValid'> & {
        resultsStarts: Complex[];
        resultsEnds: Complex[];
      }
    >;
    allXSeedResultsStarts: Complex[][];
    allXSeedResultsEnds: Complex[][];
  } => {
    return {
      allXSeedsCalculated: !activeSheetXSeeds.some(
        (xSeed) => xSeed.resultIds.length === 0
      ),
      xSeedsRemovalDisabled: activeSheetXSeeds.length < 2,
      xSeeds: activeSheetXSeeds.map((xSeed) => ({
        id: xSeed.id,
        color: xSeed.color,
        value: xSeed.value,
        resultsValid: xSeed.resultsValid,
        // TODO this will not memoize properly
        resultsStarts: selectXSeedResults(state, xSeed.id).map(
          (result) => result.values[0]
        ),
        resultsEnds: selectXSeedResults(state, xSeed.id).map(
          (result) => result.values[result.values.length - 1]
        ),
      })),
      allXSeedResultsStarts: activeSheetXSeeds.map((xSeed) => {
        const results = selectXSeedResults(state, xSeed.id);
        if (!results) throw new Error('Results not found');
        return results.map((result) => result.values[0]);
      }),
      allXSeedResultsEnds: activeSheetXSeeds.map((xSeed) => {
        const results = selectXSeedResults(state, xSeed.id);
        if (!results) throw new Error('results not found');
        return results.map((result) => result.values[result.values.length - 1]);
      }),
    };
  }
);
