import { css } from '@emotion/react';
import { Circle, ContentCopy, Square } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import clipboard from 'clipboardy';
import React, { useCallback } from 'react';
import { selectActiveSheetResultsStartEnd } from '../../../redux/selectors/selectActiveSheetResultsStartEnd';

import { useAppSelector } from '../../../redux/store';

import { stringifyArrayOfComplexArraysForMathematica } from '../../../util/mathematica';

function ResultsStartEndCopyButtons() {
  const { allXSeedsCalculated, allXSeedResultsStarts, allXSeedResultsEnds } =
    useAppSelector(selectActiveSheetResultsStartEnd);

  const copyResultsStart = useCallback(
    (_e: React.MouseEvent<HTMLButtonElement>) => {
      if (allXSeedsCalculated) {
        clipboard.write(
          stringifyArrayOfComplexArraysForMathematica(allXSeedResultsStarts)
        );
      }
    },
    [allXSeedsCalculated, allXSeedResultsStarts]
  );

  const copyResultsEnd = useCallback(
    (_e: React.MouseEvent<HTMLButtonElement>) => {
      if (allXSeedsCalculated) {
        clipboard.write(
          stringifyArrayOfComplexArraysForMathematica(allXSeedResultsEnds)
        );
      }
    },
    [allXSeedsCalculated, allXSeedResultsEnds]
  );

  return (
    <>
      <IconButton
        onClick={copyResultsStart}
        css={css`
          position: relative;
        `}
        disabled={!allXSeedsCalculated}
      >
        <ContentCopy />
        <Square
          css={css`
            width: 13px;
            height: 13px;
            position: absolute;
            bottom: 5px;
            right: 5px;
            color: #999;
          `}
        />
      </IconButton>
      <IconButton
        onClick={copyResultsEnd}
        css={css`
          position: relative;
        `}
        disabled={!allXSeedsCalculated}
      >
        <ContentCopy />
        <Circle
          css={css`
            width: 13px;
            height: 13px;
            position: absolute;
            bottom: 5px;
            right: 5px;
            color: #999;
          `}
        />
      </IconButton>
    </>
  );
}

export default ResultsStartEndCopyButtons;
