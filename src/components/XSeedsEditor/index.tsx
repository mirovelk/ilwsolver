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
import Paper from 'paper';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChromePicker } from 'react-color';

import {
  addSolverToActiveSheet,
  removeSolverFromActiveSheet,
  selectActiveSheetSolvers,
  selectM,
  setSolverColor,
  setXSeedNumberPart,
  setXSeedsM,
  setXSeedsValues,
} from '../../redux/features/app/appSlice';
import { SolverId, XSeedValue } from '../../redux/features/app/types';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { stringifyForMathematica } from '../../util/mathematica';

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
  margin-bottom: 10px;
`;

const XSeedComplex = styled(MaterialPaper)`
  display: flex;
  padding: 5px;

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const XSeedComplexPart = styled(MaterialPaper)`
  padding: 5px;
  width: 100px;

  &:not(:last-child) {
    margin-right: 5px;
  }
`;

const XSeedComplexPartInput = styled(TextField)``;

const AddXSeedButton = styled(IconButton)``;

const XSeedWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;

const controlOffset = '10px';

const XSeedRemoveWrapper = styled.div`
  margin-top: ${controlOffset};
  margin-right: 10px;
`;

const XSeedColorWrapper = styled.div`
  margin-top: ${controlOffset};
  position: relative;
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

const XSeedColor = styled.div<{ seedColor: paper.Color }>`
  display: inline-block;
  height: 30px;
  width: 30px;
  border-radius: 4px;
  background: ${({ seedColor }) => seedColor.toCSS(true)};
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

function parseXSeeds(input: string): XSeedValue[] {
  return JSON.parse(input.replaceAll('{', '[').replaceAll('}', ']'));
}

function stringifyXSeedValues(xSeeds: XSeedValue[]) {
  let output = '';
  output += '{';
  xSeeds.forEach((xSeed, xSeedIndex) => {
    output += '{';
    output += '\n';
    xSeed.forEach((c, cIndex) => {
      output += '  { ';
      output += c[0];
      output += ', ';
      output += c[1];
      output += ' }';
      if (cIndex < xSeed.length - 1) output += ',';
    });
    output += '\n';
    output += '}';
    if (xSeedIndex < xSeeds.length - 1) output += ',';
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
  const solvers = useAppSelector(selectActiveSheetSolvers);
  const M = useAppSelector(selectM);

  const xSeeds = useMemo(
    () => solvers.map((solver) => solver.xSeed),
    [solvers]
  );

  const allXSeedsCalculated = useMemo(
    () => !solvers.some((solver) => typeof solver.outputValues === 'undefined'),
    [solvers]
  );

  const [xSeedsTextareaValue, setXSeedsTextareaValue] = useState(
    stringifyXSeeds(xSeeds)
  );
  const [xSeedsTextareaEditing, setXSeedsTextareaEditing] = useState(false);
  const [xSeedsTextareaError, setXSeedsTextareaError] = useState(false);

  const [visibleColorPickerSolverId, setVisibleColorPickerSolverId] =
    useState<SolverId | null>(null);

  // reflect xSeeds changes back into textarea area when not editing
  useEffect(() => {
    if (!xSeedsTextareaEditing) {
      setXSeedsTextareaValue(stringifyXSeeds(xSeeds));
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
    dispatch(addSolverToActiveSheet());
  }, [dispatch]);

  const removeXSeed = useCallback(
    (solverId: SolverId) => {
      dispatch(removeSolverFromActiveSheet(solverId));
    },
    [dispatch]
  );

  const xSeedComplexPartInputOnChange = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const solverId = e.target.dataset.solverId as SolverId;
      const cIndex = parseInt(e.target.dataset.cIndex as string);
      const cPartIndex = parseInt(e.target.dataset.cPartIndex as string);
      const value =
        e.currentTarget.value.trim() === ''
          ? 0 // coplex part can not be undefined
          : parseFloat(e.currentTarget.value);
      dispatch(
        setXSeedNumberPart({
          solverId,
          xSeedNumberIndex: cIndex,
          xSeedNumberPartIndex: cPartIndex,
          value,
        })
      );
    },
    [dispatch]
  );

  const copyResultsStart = useCallback(
    (_e: React.MouseEvent<HTMLButtonElement>) => {
      if (allXSeedsCalculated) {
        const starts = solvers.map((solver) => {
          const ouputValues = solver.outputValues;
          if (!ouputValues) throw new Error('ouputValues not found');
          return ouputValues.map((output) => output[0]);
        });
        clipboard.write(stringifyForMathematica(starts));
      }
    },
    [allXSeedsCalculated, solvers]
  );

  const copyResultsEnd = useCallback(
    (_e: React.MouseEvent<HTMLButtonElement>) => {
      if (allXSeedsCalculated) {
        const ends = solvers.map((solver) => {
          const ouputValues = solver.outputValues;
          if (!ouputValues) throw new Error('ouputValues not found');
          return ouputValues.map((output) => output[output.length - 1]);
        });
        clipboard.write(stringifyForMathematica(ends));
      }
    },
    [allXSeedsCalculated, solvers]
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
        {solvers.map((solver) => (
          <XSeedWrapper key={solver.id}>
            <XSeedRemoveWrapper>
              <IconButton
                size="small"
                disabled={xSeeds.length < 2}
                onClick={() => removeXSeed(solver.id)}
              >
                <Remove fontSize="inherit" />
              </IconButton>
            </XSeedRemoveWrapper>
            <XSeedColorWrapper>
              <XSeedColor
                seedColor={new Paper.Color(solver.color)}
                onClick={() =>
                  setVisibleColorPickerSolverId(
                    (previousVisibleColorPickerSolverId) =>
                      previousVisibleColorPickerSolverId !== solver.id
                        ? solver.id
                        : null
                  )
                }
              />
              <XSeedColorPickerWrapper>
                {visibleColorPickerSolverId === solver.id && (
                  <ChromePicker
                    color={new Paper.Color(solver.color).toCSS(true)}
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
                        setSolverColor({
                          solverId: solver.id,
                          color: new Paper.Color(color.hex).toCSS(true),
                        })
                      );
                    }}
                  />
                )}
              </XSeedColorPickerWrapper>
            </XSeedColorWrapper>
            <XSeedInputs>
              {solver.xSeed.map((c, cIndex) => (
                <XSeedComplex elevation={0} key={cIndex}>
                  {c.map((cPart, cPartIndex) => (
                    <XSeedComplexPart elevation={0} key={cPartIndex}>
                      <XSeedComplexPartInput
                        value={cPart}
                        variant="standard"
                        type="number"
                        inputProps={{
                          step: 0.1,
                          'data-solver-id': solver.id,
                          'data-c-index': cIndex,
                          'data-c-part-index': cPartIndex,
                        }}
                        onChange={xSeedComplexPartInputOnChange}
                      />
                      {solver.outputValues && (
                        <XSeedCalculatedValue
                          css={css`
                            margin-top: 3px;
                          `}
                        >
                          <XSeedStartIcon />
                          {solver.outputValues
                            .map((output) => output[0])
                            [cIndex][cPartIndex]?.toExponential(3)}
                        </XSeedCalculatedValue>
                      )}

                      {solver.outputValues && (
                        <XSeedCalculatedValue>
                          <XSeedEndIcon />
                          {solver.outputValues
                            .map((output) => output[output.length - 1])
                            [cIndex][cPartIndex]?.toExponential(3)}
                        </XSeedCalculatedValue>
                      )}
                    </XSeedComplexPart>
                  ))}
                </XSeedComplex>
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
