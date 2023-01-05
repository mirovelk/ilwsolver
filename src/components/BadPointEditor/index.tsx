import styled from '@emotion/styled';
import { Paper as MaterialPaper, TextField, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import {
  selectBadPoints,
  setBadPoints,
} from '../../redux/features/app/appSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { Complex, parseComplex, stringifyComplex } from '../../util/complex';

const Wrapper = styled(MaterialPaper)`
  display: inline-flex;
  flex-direction: column;
  padding: 10px 20px;
`;

const XSeedsHeader = styled.div`
  display: flex;
  margin-bottom: 5px;
`;

const BadPointsInput = styled(TextField)`
  min-width: 400px;
`;

// ignores all whitespace, including spaces inside numbers
function parseBadPoints(input: string): Complex[] {
  const noWhitespaceInput = input.replace(/\s/g, '');

  if (noWhitespaceInput.length === 0) return [];

  if (
    noWhitespaceInput[0] !== '{' ||
    noWhitespaceInput[noWhitespaceInput.length - 1] !== '}'
  )
    throw new Error('Invalid input');

  const inputWithoutBrackets = noWhitespaceInput.slice(1, -1);

  const points = inputWithoutBrackets.split(',').map(parseComplex);

  return points;
}

function stringifyBadPoints(points: Complex[]) {
  let output = '';
  output += '{';
  output += '\n';
  points.forEach((point, pointIndex) => {
    output += `  ${stringifyComplex(point, true)}`;
    if (pointIndex < points.length - 1) output += ',';
    output += '\n';
  });
  output += '}';

  return output;
}

function BadPointEditor() {
  const dispatch = useAppDispatch();

  const badPoints = useAppSelector(selectBadPoints);

  const [badPointsInput, setBadPointsInput] = useState(
    stringifyBadPoints(badPoints)
  );
  const [badPointsInputError, setBadPointsInputError] = useState(false);

  const badPointsInputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setBadPointsInput(value);

      try {
        const badPointsParsed = parseBadPoints(value);
        if (
          Array.isArray(badPointsParsed) &&
          badPointsParsed.every(
            (badPoint) =>
              Array.isArray(badPoint) &&
              badPoint.length === 2 &&
              typeof badPoint[0] === 'number' &&
              typeof badPoint[1] === 'number'
          )
        ) {
          setBadPointsInputError(false);
          dispatch(setBadPoints(badPointsParsed));
        } else {
          throw new Error('invalid input');
        }
      } catch (e) {
        setBadPointsInputError(true);
      }
    },
    [dispatch]
  );

  return (
    <Wrapper elevation={3}>
      <XSeedsHeader>
        <Typography
          variant="h6"
          color="text.secondary"
          gutterBottom
          style={{ marginRight: '20px' }}
        >
          Points
        </Typography>
      </XSeedsHeader>

      <BadPointsInput
        value={badPointsInput}
        error={badPointsInputError}
        onChange={badPointsInputOnChange}
        multiline
        helperText={badPointsInputError ? 'Invalid input' : ''}
      />
    </Wrapper>
  );
}

export default BadPointEditor;
