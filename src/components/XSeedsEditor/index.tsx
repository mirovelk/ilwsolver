/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Add, Circle, ContentCopy, Remove, Star } from '@mui/icons-material';
import { IconButton, Paper as MaterialPaper, TextField, Typography } from '@mui/material';
import Paper from 'paper';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChromePicker } from 'react-color';

import {
  addXSeedAction,
  copyResultToXSeedAction,
  getRandomXSeedPartNumber,
  removeXSeedAction,
  setSolverColorAction,
  setXSeedNumberPartAction,
  setXSeedsMAction,
  setXSeedsValuesAction,
  XSeedValue,
} from '../../support/AppStateProvider/reducer';
import useAppDispatch from '../../support/AppStateProvider/useAppDispatch';
import useAppStateSolvers from '../../support/AppStateProvider/useAppStateSolvers';

const LeftControlsWrapper = styled(MaterialPaper)`
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

const AddXSeedButtonWrapper = styled.div``;

const XSeedsMWrapper = styled.div`
  display: flex;
  align-items: baseline;
`;

const XSeedsMInput = styled(TextField)`
  width: 40px;
  margin-left: 5px;
`;

const XSeedInput = styled(TextField)``;

const XSeedsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 10px;
`;

const XSeedContent = styled.div`
  display: flex;
  padding: 5px;
  &:not(:last-child) {
    margin-bottom: 10px;
  }
`;

const XSeedRoot = styled(MaterialPaper)`
  display: flex;
  padding: 5px;
  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const XSeedRootPart = styled(MaterialPaper)`
  padding: 5px;
  width: 100px;
  &:not(:last-child) {
    margin-right: 5px;
  }
`;

const XSeedRootPartInput = styled(TextField)``;

const AddXSeedButton = styled(IconButton)``;

const XSeedWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const XSeedRemoveWrapper = styled.div`
  margin-right: 10px;
`;

const XSeedColorWrapper = styled.div`
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

function parseXSeeds(input: string): XSeedValue[] {
  return JSON.parse(input.replaceAll("{", "[").replaceAll("}", "]"));
}

function stringifyXSeedValues(xSeeds: XSeedValue[]) {
  let output = "";
  output += "{";
  xSeeds.forEach((xSeed, xSeedIndex) => {
    output += "{";
    output += "\n";
    xSeed.forEach((c, cIndex) => {
      output += "  { ";
      output += c[0];
      output += ", ";
      output += c[1];
      output += " }";
      if (cIndex < xSeed.length - 1) output += ",";
    });
    output += "\n";
    output += "}";
    if (xSeedIndex < xSeeds.length - 1) output += ",";
  });
  output += "}";

  return output;
}

function stringifyXSeeds(xSeeds: XSeedValue[]) {
  return stringifyXSeedValues(xSeeds);
}

function XSeedsEditor() {
  const { appDispatch } = useAppDispatch();
  const { appStateSolvers } = useAppStateSolvers();

  const xSeeds = useMemo(
    () => appStateSolvers.map((solver) => solver.xSeed),
    [appStateSolvers]
  );

  const calculatedXSeeds = useMemo(
    () => appStateSolvers.map((solver) => solver.calculatedXSeed),
    [appStateSolvers]
  );

  const xSeedsM = useMemo(() => xSeeds[0].length, [xSeeds]);

  const [xSeedsInput, setXSeedsInput] = useState(stringifyXSeeds(xSeeds));
  const [xSeedsInputEditing, setXSeedsInputEditing] = useState(false);
  const [xSeedsInputError, setXSeedsInputError] = useState(false);

  const [visibleColorPickerIndex, setVisibleColorPickerIndex] = useState<
    number | null
  >(null);

  // reflect xSeeds changes back into editing area when not editing
  useEffect(() => {
    if (!xSeedsInputEditing) {
      setXSeedsInput(stringifyXSeeds(xSeeds));
      setXSeedsInputError(false);
    }
  }, [xSeeds, xSeedsInputEditing]);

  const xSeedInputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setXSeedsInputEditing(true);

      const value = e.currentTarget.value;
      setXSeedsInput(value);

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
                  typeof c[0] === "number" &&
                  typeof c[1] === "number"
              )
          )
        ) {
          setXSeedsInputError(false);
          appDispatch(setXSeedsValuesAction(xSeedsParsed));
        } else {
          throw new Error("invalid input");
        }
      } catch {
        setXSeedsInputError(true);
      }
    },
    [appDispatch]
  );

  const xSeedInputOnBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setXSeedsInputEditing(false);
    },
    [setXSeedsInputEditing]
  );

  const xSeedsMInputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newM = parseInt(e.currentTarget.value);
      if (typeof newM === "number" && !isNaN(newM) && newM > 0) {
        appDispatch(setXSeedsMAction(newM));
      }
    },
    [appDispatch]
  );

  const addXSeedOnClick = useCallback(() => {
    appDispatch(addXSeedAction());
  }, [appDispatch]);

  const removeXSeedWithIndex = useCallback(
    (index: number) => {
      appDispatch(removeXSeedAction(index));
    },
    [appDispatch]
  );

  const xSeedOnChange = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const xSeedIndex = parseInt(e.target.dataset.xSeedIndex as string);
      const cIndex = parseInt(e.target.dataset.cIndex as string);
      const cPartIndex = parseInt(e.target.dataset.cPartIndex as string);
      const value =
        e.currentTarget.value.trim() === ""
          ? undefined
          : parseFloat(e.currentTarget.value);
      appDispatch(
        setXSeedNumberPartAction(xSeedIndex, cIndex, cPartIndex, value)
      );
    },
    [appDispatch]
  );

  // fill in random numbers instead of nulls
  const xSeedOnBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const xSeedIndex = parseInt(e.target.dataset.xSeedIndex as string);
      const cIndex = parseInt(e.target.dataset.cIndex as string);
      const cPartIndex = parseInt(e.target.dataset.cPartIndex as string);
      const value =
        e.currentTarget.value.trim() === ""
          ? getRandomXSeedPartNumber()
          : parseFloat(e.currentTarget.value);
      appDispatch(
        setXSeedNumberPartAction(xSeedIndex, cIndex, cPartIndex, value)
      );
    },
    [appDispatch]
  );

  const copyResultToXSeedOnClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      appDispatch(copyResultToXSeedAction());
    },
    [appDispatch]
  );

  return (
    <LeftControlsWrapper elevation={3}>
      <XSeedsHeader>
        <Typography
          variant="h6"
          color="text.secondary"
          gutterBottom
          style={{ marginRight: "20px" }}
        >
          xSeeds
        </Typography>

        <XSeedsHeaderControlsWrapper>
          <XSeedsMWrapper>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              M=
            </Typography>
            <XSeedsMInput
              value={xSeedsM}
              variant="standard"
              type="number"
              onChange={xSeedsMInputOnChange}
            />
          </XSeedsMWrapper>
          <AddXSeedButtonWrapper>
            <IconButton onClick={copyResultToXSeedOnClick}>
              <ContentCopy />
            </IconButton>
            <AddXSeedButton onClick={addXSeedOnClick}>
              <Add />
            </AddXSeedButton>
          </AddXSeedButtonWrapper>
        </XSeedsHeaderControlsWrapper>
      </XSeedsHeader>

      <XSeedsWrapper>
        {xSeeds.map((xSeed, xSeedIndex) => (
          <XSeedWrapper key={xSeedIndex}>
            <XSeedRemoveWrapper>
              <IconButton
                size="small"
                disabled={xSeeds.length < 2}
                onClick={() => removeXSeedWithIndex(xSeedIndex)}
              >
                <Remove fontSize="inherit" />
              </IconButton>
            </XSeedRemoveWrapper>
            <XSeedColorWrapper>
              <XSeedColor
                seedColor={appStateSolvers[xSeedIndex].color}
                onClick={() =>
                  setVisibleColorPickerIndex(
                    (previousVisibleColorPickerIndex) =>
                      previousVisibleColorPickerIndex !== xSeedIndex
                        ? xSeedIndex
                        : null
                  )
                }
              />
              <XSeedColorPickerWrapper>
                {visibleColorPickerIndex === xSeedIndex && (
                  <ChromePicker
                    color={appStateSolvers[xSeedIndex].color.toCSS(true)}
                    disableAlpha
                    styles={{
                      default: {
                        picker: {
                          background: "#111111",
                        },
                      },
                    }}
                    onChange={(color) => {
                      appDispatch(
                        setSolverColorAction(
                          xSeedIndex,
                          new Paper.Color(color.hex)
                        )
                      );
                    }}
                  />
                )}
              </XSeedColorPickerWrapper>
            </XSeedColorWrapper>
            <XSeedContent key={xSeedIndex}>
              {xSeed.map((c, cIndex) => (
                <XSeedRoot elevation={0} key={cIndex}>
                  {c.map((cPart, cPartIndex) => (
                    <XSeedRootPart elevation={0} key={cPartIndex}>
                      <XSeedRootPartInput
                        value={typeof cPart !== "undefined" ? cPart : ""}
                        variant="standard"
                        type="number"
                        inputProps={{
                          step: 0.1,
                          "data-x-seed-index": xSeedIndex,
                          "data-c-index": cIndex,
                          "data-c-part-index": cPartIndex,
                        }}
                        onChange={xSeedOnChange}
                        onBlur={xSeedOnBlur}
                      />
                      {calculatedXSeeds &&
                        calculatedXSeeds[xSeedIndex] &&
                        calculatedXSeeds[xSeedIndex]?.start && (
                          <div
                            css={css`
                              margin-top: 3px;
                              overflow: hidden;
                              color: #666666;
                              font-size: 13px;
                              white-space: nowrap;
                              display: flex;
                              align-items: center;
                            `}
                          >
                            <Star
                              css={css`
                                width: 15px;
                                height: 15px;
                                position: relative;
                                margin-right: 2px;
                                top: -1px;
                              `}
                            />
                            {
                              // @ts-ignore
                              calculatedXSeeds[xSeedIndex]?.start[cIndex][
                                cPartIndex
                              ].toExponential(3)
                            }
                          </div>
                        )}

                      {calculatedXSeeds &&
                        calculatedXSeeds[xSeedIndex] &&
                        calculatedXSeeds[xSeedIndex]?.end && (
                          <div
                            css={css`
                              overflow: hidden;
                              color: #666666;
                              font-size: 13px;
                              white-space: nowrap;
                              display: flex;
                              align-items: center;
                            `}
                          >
                            <Circle
                              css={css`
                                width: 13px;
                                height: 13px;
                                position: relative;
                                margin-right: 4px;
                                top: -1px;
                              `}
                            />
                            {
                              // @ts-ignore
                              calculatedXSeeds[xSeedIndex]?.end[cIndex][
                                cPartIndex
                              ].toExponential(3)
                            }
                          </div>
                        )}
                    </XSeedRootPart>
                  ))}
                </XSeedRoot>
              ))}
            </XSeedContent>
          </XSeedWrapper>
        ))}
      </XSeedsWrapper>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Edit:
      </Typography>
      <XSeedInput
        value={xSeedsInput}
        error={xSeedsInputError}
        onChange={xSeedInputOnChange}
        onBlur={xSeedInputOnBlur}
        multiline
        helperText={xSeedsInputError ? "Invalid input" : ""}
      />
    </LeftControlsWrapper>
  );
}

export default React.memo(XSeedsEditor);
