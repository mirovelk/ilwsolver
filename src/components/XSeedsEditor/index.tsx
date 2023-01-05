import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Add, Circle, ContentCopy, Remove, Square } from '@mui/icons-material';
import {
  IconButton,
  Paper as MaterialPaper,
  TextField,
  Typography,
} from '@mui/material';
import clipboard from 'clipboardy';
import React, { useCallback, useEffect, useState } from 'react';
import { ChromePicker } from 'react-color';

import {
  activeSheetXSeedHasError,
  addXSeedToActiveSheet,
  removeXSeedFromActiveSheet,
  selectM,
  selectXSeedEditorData,
  setXSeedColor,
  setXSeedNumber,
  setXSeedsM,
  setXSeedsValues,
} from '../../redux/features/app/appSlice';
import { XSeedId, XSeedValue } from '../../redux/features/app/types';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { Complex, parseComplex, stringifyComplex } from '../../util/complex';
import { stringifyArrayOfComplexArraysForMathematica } from '../../util/mathematica';
import ComplexEditor from '../ComplexEditor';

const Panel = styled(MaterialPaper)`
  display: inline-flex;
  flex-direction: column;
  position: absolute;
  z-index: 2000;
  top: 135px;
  left: 30px;
  padding: 10px 20px;
`;

const XSeedsHeader = styled.div`
  display: flex;
  margin-bottom: 5px;
`;

const XSeedsHeaderControlsWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
`;
const HeaderRight = styled.div`
  display: flex;
`;

const CopyButtonsWrapper = styled.div``;

const AddXSeedButtonWrapper = styled.div``;

const XSeedsMWrapper = styled.div`
  display: flex;
  margin-right: 15px;
  align-items: baseline;
`;

const XSeedsMInput = styled(TextField)`
  width: 40px;
  margin-left: 5px;
`;

const XSeedTextarea = styled(TextField)``;

const XSeedsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 10px;
`;

const XSeedInputs = styled.div`
  display: flex;
`;

const XSeedComplexWrapper = styled.div`
  margin-right: 10px;
`;

const AddXSeedButton = styled(IconButton)``;

const XSeedWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
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

const XSeedColor = styled.div<{ seedColor: string }>`
  display: inline-block;
  height: 30px;
  width: 30px;
  border-radius: 4px;
  background: ${({ seedColor }) => seedColor};
  cursor: pointer;
`;

const XSeedColorPickerWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 40px;
  margin-top: 15;
  z-index: 4000;
`;

const XSeedStartIcon = styled(Square)`
  width: 13px;
  height: 13px;
  position: relative;
  margin-right: 4px;
  top: -1px;
`;

const XSeedEndIcon = styled(Circle)`
  width: 13px;
  height: 13px;
  position: relative;
  margin-right: 4px;
  top: -1px;
`;

const XSeedCalculatedValue = styled.div`
  overflow: hidden;
  color: #999;
  font-size: 13px;
  white-space: nowrap;
  display: flex;
  align-items: center;
`;

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

// TODO refactor into smaller components
function XSeedsEditor() {
  const dispatch = useAppDispatch();
  const {
    allXSeedsCalculated,
    xSeedsRemovalDisabled,
    allXSeedResultsStarts,
    allXSeedResultsEnds,
    xSeeds,
  } = useAppSelector(selectXSeedEditorData);
  const M = useAppSelector(selectM);

  const [xSeedsTextareaValue, setXSeedsTextareaValue] = useState(
    stringifyXSeeds(xSeeds.map((xSeed) => xSeed.value))
  );
  const [xSeedsTextareaEditing, setXSeedsTextareaEditing] = useState(false);
  const [xSeedsTextareaError, setXSeedsTextareaError] = useState(false);

  const [visibleColorPickerXSeedId, setVisibleColorPickerXSeedId] =
    useState<XSeedId | null>(null);

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
          dispatch(setXSeedsValues(xSeedsParsed));
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

  const xSeedsMInputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newM = parseInt(e.currentTarget.value);
      if (typeof newM === 'number' && !isNaN(newM) && newM > 0) {
        dispatch(setXSeedsM(newM));
      }
    },
    [dispatch]
  );

  const addXSeedOnClick = useCallback(() => {
    dispatch(addXSeedToActiveSheet());
  }, [dispatch]);

  const removeXSeed = useCallback(
    (xSeedId: XSeedId) => {
      dispatch(removeXSeedFromActiveSheet(xSeedId));
    },
    [dispatch]
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
    <Panel elevation={3}>
      <XSeedsHeader>
        <Typography
          variant="h6"
          color="text.secondary"
          gutterBottom
          style={{ marginRight: '20px' }}
        >
          xSeeds
        </Typography>

        <XSeedsHeaderControlsWrapper>
          <HeaderLeft>
            <CopyButtonsWrapper>
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
            </CopyButtonsWrapper>
          </HeaderLeft>
          <HeaderRight>
            <XSeedsMWrapper>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                M=
              </Typography>
              <XSeedsMInput
                value={M}
                variant="standard"
                type="number"
                onChange={xSeedsMInputOnChange}
              />
            </XSeedsMWrapper>

            <AddXSeedButtonWrapper>
              <AddXSeedButton onClick={addXSeedOnClick}>
                <Add />
              </AddXSeedButton>
            </AddXSeedButtonWrapper>
          </HeaderRight>
        </XSeedsHeaderControlsWrapper>
      </XSeedsHeader>

      <XSeedsWrapper>
        {xSeeds.map((xSeed) => (
          <XSeedWrapper key={xSeed.id}>
            <XSeedRemoveWrapper>
              <IconButton
                size="small"
                disabled={xSeedsRemovalDisabled}
                onClick={() => removeXSeed(xSeed.id)}
              >
                <Remove fontSize="inherit" />
              </IconButton>
            </XSeedRemoveWrapper>
            <XSeedColorWrapper>
              <XSeedColor
                seedColor={xSeed.color}
                onClick={() =>
                  setVisibleColorPickerXSeedId(
                    (previousVisibleColorPickerXSeedId) =>
                      previousVisibleColorPickerXSeedId !== xSeed.id
                        ? xSeed.id
                        : null
                  )
                }
              />
              <XSeedColorPickerWrapper>
                {visibleColorPickerXSeedId === xSeed.id && (
                  <ChromePicker
                    color={xSeed.color}
                    disableAlpha
                    styles={{
                      default: {
                        picker: {
                          background: '#111111',
                        },
                      },
                    }}
                    onChange={(color) => {
                      dispatch(
                        setXSeedColor({
                          xSeedId: xSeed.id,
                          color: color.hex,
                        })
                      );
                    }}
                  />
                )}
              </XSeedColorPickerWrapper>
            </XSeedColorWrapper>
            <XSeedInputs>
              {xSeed.value.map((c, cIndex) => (
                <XSeedComplexWrapper key={cIndex}>
                  <ComplexEditor
                    value={c}
                    onEditFinished={(value) => {
                      xSeedComplexOnEditFinished(xSeed.id, cIndex, value);
                    }}
                    showError={() => {
                      dispatch(activeSheetXSeedHasError(true));
                    }}
                    hideError={() => {
                      dispatch(activeSheetXSeedHasError(false));
                    }}
                  />

                  {xSeed.resultsValid && (
                    <>
                      <XSeedCalculatedValue
                        css={css`
                          margin-top: 3px;
                        `}
                      >
                        <XSeedStartIcon />
                        {stringifyComplex(xSeed.resultsStarts[cIndex])}
                      </XSeedCalculatedValue>
                      <XSeedCalculatedValue>
                        <XSeedEndIcon />
                        {stringifyComplex(xSeed.resultsEnds[cIndex])}
                      </XSeedCalculatedValue>
                    </>
                  )}
                </XSeedComplexWrapper>
              ))}
            </XSeedInputs>
          </XSeedWrapper>
        ))}
      </XSeedsWrapper>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Edit:
      </Typography>
      <XSeedTextarea
        value={xSeedsTextareaValue}
        error={xSeedsTextareaError}
        onChange={xSeedTextareaOnChange}
        onBlur={xSeedTextareaOnBlur}
        multiline
        helperText={xSeedsTextareaError ? 'Invalid input' : ''}
      />
    </Panel>
  );
}

export default React.memo(XSeedsEditor);
