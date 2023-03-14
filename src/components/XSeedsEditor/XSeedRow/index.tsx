import styled from '@emotion/styled';
import { Remove } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { selectActiveSheetXSeedIds } from '../../../redux/features/sheets/sheetsSlice';
import {
  removeXSeed,
  setXSeedNumber,
  xSeedHasError,
  XSeedId,
  xSeedValueSelector,
} from '../../../redux/features/xSeeds/xSeedsSlice';

import { useAppDispatch, useAppSelector } from '../../../redux/store';

import { Complex } from '../../../util/complex';
import ComplexEditor from '../../ComplexEditor';
import XSeedColor from './XSeedColor';

const XSeedInputs = styled.div`
  display: flex;
`;

const XSeedComplexWrapper = styled.div`
  margin-right: 10px;
`;

const controlsOffset = '5px';

const XSeedRemoveWrapper = styled.div`
  margin-top: ${controlsOffset};
  margin-right: 10px;
`;

const XSeedColorWrapper = styled.div`
  margin-top: ${controlsOffset};
  position: relative;
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

const selectCanRemoveActiveSheetXSeed = createSelector(
  [selectActiveSheetXSeedIds],
  (activeSheetXSeedIds) => activeSheetXSeedIds.length > 1
);

function XSeedRow({ xSeedId }: { xSeedId: XSeedId }) {
  const dispatch = useAppDispatch();

  const xSeedValue = useAppSelector((state) =>
    xSeedValueSelector(state, xSeedId)
  );

  const canRemoveActiveSheetXSeed = useAppSelector(
    selectCanRemoveActiveSheetXSeed
  );

  const xSeedComplexOnEditFinished = useCallback(
    (xSeedId: XSeedId, xSeedCIndex: number, xSeedCValue: Complex) => {
      dispatch(
        setXSeedNumber({
          xSeedId,
          xSeedNumberIndex: xSeedCIndex,
          value: xSeedCValue,
        })
      );
    },
    [dispatch]
  );

  return (
    <>
      <XSeedRemoveWrapper>
        <IconButton
          size="small"
          disabled={!canRemoveActiveSheetXSeed}
          onClick={() => removeXSeed(xSeedId)}
        >
          <Remove fontSize="inherit" />
        </IconButton>
      </XSeedRemoveWrapper>
      <XSeedColorWrapper>
        <XSeedColor xSeedId={xSeedId} />
      </XSeedColorWrapper>
      <XSeedInputs>
        {xSeedValue.map((c, cIndex) => (
          <XSeedComplexWrapper key={cIndex}>
            <ComplexEditor
              value={c}
              onValidChange={(value) => {
                xSeedComplexOnEditFinished(xSeedId, cIndex, value);
                dispatch(xSeedHasError({ xSeedId: xSeedId, hasError: false }));
              }}
              onError={() => {
                dispatch(xSeedHasError({ xSeedId: xSeedId, hasError: true }));
              }}
            />
          </XSeedComplexWrapper>
        ))}
      </XSeedInputs>
    </>
  );
}

export default XSeedRow;
