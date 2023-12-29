import styled from '@emotion/styled';
import { TextField, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { selectM, setXSeedsM } from 'redux/features/xSeeds/xSeedsSlice';
import { useAppDispatch, useAppSelector } from 'redux/store';

const XSeedsMInput = styled(TextField)`
  width: 40px;
  margin-left: 5px;
`;

function MInput() {
  const dispatch = useAppDispatch();
  const M = useAppSelector(selectM);

  const xSeedsMInputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newM = parseInt(e.currentTarget.value);
      if (typeof newM === 'number' && !isNaN(newM) && newM > 0) {
        dispatch(setXSeedsM(newM));
      }
    },
    [dispatch]
  );

  return (
    <>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        M=
      </Typography>
      <XSeedsMInput
        value={M}
        variant="standard"
        type="number"
        onChange={xSeedsMInputOnChange}
      />
    </>
  );
}

export default MInput;
