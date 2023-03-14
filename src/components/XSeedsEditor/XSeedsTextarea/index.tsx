import styled from '@emotion/styled';
import { TextField, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { XSeedValue } from '../../../redux/features/xSeeds/xSeedsSlice';
import { selectXSeedEditorData } from '../../../redux/selectors/selectXSeedEditorData';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { setXSeedsValues } from '../../../redux/thunks/setXSeedsValues';
import { parseComplex, stringifyComplex } from '../../../util/complex';

const Textarea = styled(TextField)``;

// parse {{2-3i,3-2i},{2+3i,2+4i}} into [['2-3i', '3-2i'], ['2+3i', '2+4i']]
// ignores all whitespace, including spaces inside numbers
function parseXSeeds(input: string): XSeedValue[] {
  const noWhitespaceInput = input.replace(/\s/g, '');
  let bracketCount = 0;
  let rowBuffer = '';
  const rows: string[] = [];

  noWhitespaceInput.split('').forEach((char) => {
    if (char === '{') {
      bracketCount++;
      if (bracketCount > 2) throw new Error('Invalid input');
    } else if (char === '}') {
      bracketCount--;
      if (bracketCount < 0) throw new Error('Invalid input');
      if (bracketCount === 0) {
        rows.push(rowBuffer);
        rowBuffer = '';
      }
    } else if (char === ',') {
      if (bracketCount === 1) {
        rows.push(rowBuffer);
        rowBuffer = '';
      } else if (bracketCount > 1) {
        rowBuffer += char;
      }
    } else {
      rowBuffer += char;
    }
  });

  if (bracketCount !== 0) throw new Error('Invalid input');

  const parsedRows: XSeedValue[] = rows.map((row) =>
    row.split(',').map(parseComplex)
  );

  return parsedRows;
}

function stringifyXSeedValues(xSeeds: XSeedValue[]) {
  let output = '';
  output += '{';
  output += '\n';
  xSeeds.forEach((xSeed, xSeedIndex) => {
    output += '  { ';
    xSeed.forEach((c, cIndex) => {
      output += stringifyComplex(c, true);
      if (cIndex < xSeed.length - 1) output += ', ';
    });
    output += ' }';
    if (xSeedIndex < xSeeds.length - 1) output += ',';
    output += '\n';
  });
  output += '}';

  return output;
}

function stringifyXSeeds(xSeeds: XSeedValue[]) {
  return stringifyXSeedValues(xSeeds);
}

function XSeedsTextarea() {
  const dispatch = useAppDispatch();
  const { xSeeds } = useAppSelector(selectXSeedEditorData);

  const [xSeedsTextareaValue, setXSeedsTextareaValue] = useState(
    stringifyXSeeds(xSeeds.map((xSeed) => xSeed.value))
  );
  const [xSeedsTextareaEditing, setXSeedsTextareaEditing] = useState(false);
  const [xSeedsTextareaError, setXSeedsTextareaError] = useState(false);

  // reflect xSeeds changes back into textarea area when not editing
  useEffect(() => {
    if (!xSeedsTextareaEditing) {
      setXSeedsTextareaValue(
        stringifyXSeeds(xSeeds.map((xSeed) => xSeed.value))
      );
      setXSeedsTextareaError(false);
    }
  }, [xSeeds, xSeedsTextareaEditing]);

  const xSeedTextareaOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setXSeedsTextareaEditing(true);

      const value = e.currentTarget.value;
      setXSeedsTextareaValue(value);

      try {
        const xSeedsParsed = parseXSeeds(value);
        if (
          Array.isArray(xSeedsParsed) &&
          xSeedsParsed.length > 0 && // at least one xSeed
          xSeedsParsed.every(
            (xSeed) =>
              Array.isArray(xSeed) &&
              xSeed.length > 0 && // at least one point in xSeed
              xSeed.length === xSeedsParsed[0].length && // all xSeeds same length
              xSeed.every(
                (c) =>
                  c.length === 2 &&
                  typeof c[0] === 'number' &&
                  typeof c[1] === 'number'
              )
          )
        ) {
          setXSeedsTextareaError(false);
          dispatch(setXSeedsValues(xSeedsParsed)); // TODO move processing here?
        } else {
          throw new Error('invalid input');
        }
      } catch {
        setXSeedsTextareaError(true);
      }
    },
    [dispatch]
  );

  const xSeedTextareaOnBlur = useCallback(
    (_e: React.FocusEvent<HTMLInputElement>) => {
      setXSeedsTextareaEditing(false);
    },
    [setXSeedsTextareaEditing]
  );

  return (
    <>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Edit:
      </Typography>
      <Textarea
        value={xSeedsTextareaValue}
        error={xSeedsTextareaError}
        onChange={xSeedTextareaOnChange}
        onBlur={xSeedTextareaOnBlur}
        multiline
        helperText={xSeedsTextareaError ? 'Invalid input' : ''}
      />
    </>
  );
}

export default XSeedsTextarea;
