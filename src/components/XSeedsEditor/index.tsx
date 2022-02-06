import styled from '@emotion/styled';
import { Add, Remove } from '@mui/icons-material';
import { IconButton, Paper as MaterialPaper, TextField, Typography } from '@mui/material';
import produce from 'immer';
import React, { useCallback, useEffect, useState } from 'react';

import { getColorForIndex } from '../../util/color';
import { Complex, getRandomComplexNumber } from '../../util/complex';

const LeftControlsWrapper = styled(MaterialPaper)`
  display: inline-flex;
  flex-direction: column;
  position: absolute;
  z-index: 2000;
  top: 80px;
  left: 40px;
  padding: 10px 20px;
`;

const XSeedsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

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

const XSeedContent = styled(MaterialPaper)`
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
  width: 70px;
  &:not(:last-child) {
    margin-right: 5px;
  }
`;

const XSeedRootPartInput = styled(TextField)``;

const AddXSeedButtonWrapper = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
`;

const AddXSeedButton = styled(IconButton)``;

const XSeedWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const XSeedRemoveWrapper = styled.div`
  margin-right: 10px;
`;

const XSeedColorWrapper = styled.div`
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
`;

export interface XSeed {
  seed: Complex[];
  color: paper.Color;
}

export type XSeeds = XSeed[];

function parseXSeeds(input: string): XSeeds {
  return JSON.parse(input.replaceAll("{", "[").replaceAll("}", "]"));
}

function stringifyXSeeds(xSeeds: XSeeds) {
  let output = "";
  output += "{";
  xSeeds.forEach((xSeed, xSeedIndex) => {
    output += "{";
    output += "\n";
    xSeed.seed.forEach((c, cIndex) => {
      output += "  {";
      output += c[0];
      output += ", ";
      output += c[1];
      output += " }";
      if (cIndex < xSeed.seed.length - 1) output += ",";
    });
    output += "\n";
    output += "}";
    if (xSeedIndex < xSeeds.length - 1) output += ",";
  });
  output += "}";

  return output;
}

function getRandomXSeedNumber(): Complex {
  return getRandomComplexNumber(-10, 10);
}

function XSeedsEditor({
  xSeeds,
  setXSeeds,
}: {
  xSeeds: XSeeds;
  setXSeeds: React.Dispatch<React.SetStateAction<XSeeds>>;
}) {
  const [xSeedsInput, setXSeedsInput] = useState(stringifyXSeeds(xSeeds));
  const [xSeedsInputError, setXSeedsInputError] = useState(false);
  const [xSeedsM, setXSeedsM] = useState(xSeeds[0].seed.length);

  // process xSeeds input
  useEffect(() => {
    try {
      const xSeedsParsed = parseXSeeds(xSeedsInput);

      if (
        Array.isArray(xSeedsParsed) &&
        xSeedsParsed.length > 0 && // at least one xSeed
        xSeedsParsed.every(
          (xSeed) =>
            Array.isArray(xSeed) &&
            xSeed.length > 0 && // at least one point in xSeed
            xSeed.length === xSeedsParsed[0].seed.length && // all xSeeds same length
            xSeed.every(
              (c) =>
                c.length === 2 &&
                typeof c[0] === "number" &&
                typeof c[1] === "number"
            )
        )
      ) {
        setXSeedsInputError(false);
        setXSeeds((previousXSeeds) =>
          JSON.stringify(xSeedsParsed) !== JSON.stringify(previousXSeeds)
            ? xSeedsParsed
            : previousXSeeds
        );
      } else {
        throw new Error("invalid input");
      }
    } catch {
      setXSeedsInputError(true);
    }
  }, [setXSeeds, xSeedsInput]);

  // reflect xSeeds changes back into editing area
  useEffect(() => {
    setXSeedsInput(stringifyXSeeds(xSeeds));
  }, [xSeeds]);

  const setXSeedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setXSeedsInput(e.currentTarget.value);
    },
    []
  );

  const xSeedsMInputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newM = parseInt(e.currentTarget.value);
      if (typeof newM === "number" && !isNaN(newM) && newM > 0) {
        setXSeedsM(newM);
        setXSeeds((previousXSeeds: XSeeds) => {
          // assuming there's always at least one xSeed
          if (previousXSeeds[0].seed.length < newM) {
            return previousXSeeds.map((xSeed) => ({
              seed: [...xSeed.seed, getRandomXSeedNumber()],
              color: xSeed.color,
            }));
          } else if (previousXSeeds[0].seed.length > newM) {
            return previousXSeeds.map((xSeed) => ({
              seed: xSeed.seed.slice(0, xSeed.seed.length - 1),
              color: xSeed.color,
            }));
          }
          return previousXSeeds;
        });
      }
    },
    [setXSeeds]
  );

  const addXSeedOnClick = useCallback(() => {
    setXSeeds((previousXSeeds: XSeeds) => {
      // assuming there's always at least one xSeed
      const M = xSeeds[0].seed.length;
      return [
        ...previousXSeeds,
        {
          seed: new Array(M).fill(null).map(() => getRandomXSeedNumber()),
          color: getColorForIndex(previousXSeeds.length),
        },
      ];
    });
  }, [setXSeeds, xSeeds]);

  const removeXSeedWithIndex = useCallback(
    (index: number) => {
      setXSeeds((previousXSeeds: XSeeds) => {
        return previousXSeeds.length > 1
          ? previousXSeeds.filter((_, itemIndex) => itemIndex !== index)
          : previousXSeeds;
      });
    },
    [setXSeeds]
  );

  const xSeedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const xSeedIndex = parseInt(e.target.dataset.xSeedIndex as string);
      const cIndex = parseInt(e.target.dataset.cIndex as string);
      const cPartIndex = parseInt(e.target.dataset.cPartIndex as string);

      const value = parseFloat(e.currentTarget.value);

      if (typeof value === "number" && !isNaN(value)) {
        setXSeeds((previousXSeeds) => {
          const nextXSeeds = produce(previousXSeeds, (draft) => {
            draft[xSeedIndex].seed[cIndex][cPartIndex] = value;
          });
          return nextXSeeds;
        });
      }
    },
    [setXSeeds]
  );

  return (
    <LeftControlsWrapper elevation={3}>
      <XSeedsHeader>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          xSeeds
        </Typography>

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
      </XSeedsHeader>

      <XSeedsWrapper>
        {xSeeds.map((xSeed, xSeedIndex) => (
          <XSeedWrapper key={xSeedIndex}>
            <XSeedRemoveWrapper>
              <IconButton
                size="small"
                onClick={() => removeXSeedWithIndex(xSeedIndex)}
              >
                <Remove fontSize="inherit" />
              </IconButton>
            </XSeedRemoveWrapper>
            <XSeedColorWrapper>
              <XSeedColor seedColor={xSeed.color} />
            </XSeedColorWrapper>
            <XSeedContent elevation={0} key={xSeedIndex}>
              {xSeed.seed.map((c, cIndex) => (
                <XSeedRoot elevation={3} key={cIndex}>
                  {c.map((cPart, cPartIndex) => (
                    <XSeedRootPart elevation={0} key={cPartIndex}>
                      <XSeedRootPartInput
                        value={cPart}
                        variant="standard"
                        type="number"
                        inputProps={{
                          step: 0.1,
                          "data-x-seed-index": xSeedIndex,
                          "data-c-index": cIndex,
                          "data-c-part-index": cPartIndex,
                        }}
                        onChange={xSeedOnChange}
                      />
                    </XSeedRootPart>
                  ))}
                </XSeedRoot>
              ))}
            </XSeedContent>
          </XSeedWrapper>
        ))}
        <AddXSeedButtonWrapper>
          <AddXSeedButton onClick={addXSeedOnClick}>
            <Add />
          </AddXSeedButton>
        </AddXSeedButtonWrapper>
      </XSeedsWrapper>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Edit:
      </Typography>
      <XSeedInput
        value={xSeedsInput}
        error={xSeedsInputError}
        onChange={setXSeedOnChange}
        multiline
        helperText={xSeedsInputError ? "Invalid input" : ""}
      />
    </LeftControlsWrapper>
  );
}

export default React.memo(XSeedsEditor);
