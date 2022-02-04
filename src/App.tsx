import styled from "@emotion/styled";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Paper from "paper";
import produce from "immer";

import StyleProvider from "./support/style/StyleProvider";
import InputArea from "./components/InputArea";
import OutputArea, { Output } from "./components/OutputArea";
import {
  IconButton,
  TextField,
  Paper as MaterialPaper,
  Typography,
  Button,
} from "@mui/material";

import { Add, Delete, Functions, Remove } from "@mui/icons-material";
import { Complex, getRandomComplexNumber } from "./util/complex";
import { solveInQArray } from "./support/calc/calc";
import { defaultScaleDownFactor, inputPaper, outputPaper } from "./papers";
import { getColorForIndex } from "./util/color";

const Wrapper = styled.div`
  position: realtive;
  height: 100%;
`;

const AreasWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 20px;
  align-items: stretch;
`;

const AreaWrapper = styled.div`
  flex: 1 0 0;
  &:not(:last-child) {
    margin-right: 20px;
  }
`;

const CenterControlsWrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 1000;
  top: 80px;
  left: 50%;
  transform: translate(-50%, 0);
`;

const LeftControlsWrapper = styled(MaterialPaper)`
  display: inline-flex;
  flex-direction: column;
  position: absolute;
  z-index: 2000;
  top: 80px;
  left: 40px;
  padding: 10px 20px;
`;

const RunButtonWrapper = styled.div`
  display: inline-flex;
`;

const ClearButtonWrapper = styled.div`
  margin-top: 5px;
`;

const StyledFunctions = styled(Functions)`
  color: rgb(18, 18, 18);
  font-size: 1.3em;
`;

const RunButton = styled(IconButton)`
  background: rgb(102, 187, 106);
  border: 10px solid rgb(18, 18, 18);
  &:hover {
    background-color: rgb(56, 142, 60);;
  }

  &:disabled {
    background-color: rgb(30, 30, 30);
`;

const ClearButton = styled(IconButton)`
  background: rgb(18, 18, 18);
  border: 10px solid rgb(18, 18, 18);
  &:hover {
    background-color: rgb(244, 67, 54);
  }

  &:disabled {
    background-color: rgb(30, 30, 30);
`;

const StyledDelete = styled(Delete)`
  color: white;
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

const XSeed = styled(MaterialPaper)`
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

const INPUT_STEPS = 1000;

type XSeeds = Complex[][];

function parseXSeeds(input: string): XSeeds {
  return JSON.parse(input.replaceAll("{", "[").replaceAll("}", "]"));
}

function stringifyXSeeds(xSeeds: XSeeds) {
  let output = "";
  output += "{";
  xSeeds.forEach((xSeed, xSeedIndex) => {
    output += "{";
    output += "\n";
    xSeed.forEach((c, cIndex) => {
      output += "  {";
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

function getRandomXSeedNumber(): Complex {
  return getRandomComplexNumber(-10, 10);
}

function App() {
  const [xSeeds, setXSeeds] = useState<XSeeds>([
    [
      [2, -3],
      [3, -2],
    ],
    [
      [2, 3],
      [2, 4],
    ],
  ]);
  const [xSeedsInput, setXSeedsInput] = useState(stringifyXSeeds(xSeeds));
  const [xSeedsInputError, setXSeedsInputError] = useState(false);
  const [xSeedsM, setXSeedsM] = useState(xSeeds[0].length);

  const [input, setInput] = useState<Complex[]>([]);
  const [outputs, setOutputs] = useState<Output[]>([]);

  const clearInputAreaPaths = useRef<() => void>();

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
  }, [xSeedsInput]);

  useEffect(() => {
    setXSeedsInput(stringifyXSeeds(xSeeds));
  }, [xSeeds]);

  const process = useCallback(() => {
    const results = xSeeds.map((xSeed) => solveInQArray(xSeed, input));

    console.log(
      JSON.stringify(input).replaceAll("[", "{").replaceAll("]", "}")
    );
    console.log(
      JSON.stringify(results).replaceAll("[", "{").replaceAll("]", "}")
    );

    const outputs = results.map((result, i) => ({
      result,
      color: getColorForIndex(i),
    }));

    setOutputs(outputs);
  }, [input, xSeeds]);

  const setXSeedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setXSeedsInput(e.currentTarget.value);
  };

  const xSeedsMInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newM = parseInt(e.currentTarget.value);
    if (typeof newM === "number" && !isNaN(newM) && newM > 0) {
      setXSeedsM(newM);
      setXSeeds((previousXSeeds: XSeeds) => {
        // assuming there's always at least one xSeed
        if (previousXSeeds[0].length < newM) {
          return previousXSeeds.map((xSeed) => [
            ...xSeed,
            getRandomXSeedNumber(),
          ]);
        } else if (previousXSeeds[0].length > newM) {
          return previousXSeeds.map((xSeed) =>
            xSeed.slice(0, xSeed.length - 1)
          );
        }
        return previousXSeeds;
      });
    }
  };

  const addXSeedOnClick = () => {
    setXSeeds((previousXSeeds: XSeeds) => {
      // assuming there's always at least one xSeed
      const M = xSeeds[0].length;
      return [
        ...previousXSeeds,
        new Array(M).fill(null).map(() => getRandomXSeedNumber()),
      ];
    });
  };

  const removeXSeedWithIndex = (index: number) => {
    setXSeeds((previousXSeeds: XSeeds) => {
      return previousXSeeds.length > 1
        ? previousXSeeds.filter((_, itemIndex) => itemIndex !== index)
        : previousXSeeds;
    });
  };

  const xSeedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const xSeedIndex = parseInt(e.target.dataset.xSeedIndex as string);
    const cIndex = parseInt(e.target.dataset.cIndex as string);
    const cPartIndex = parseInt(e.target.dataset.cPartIndex as string);

    const value = parseFloat(e.currentTarget.value);

    if (typeof value === "number" && !isNaN(value)) {
      setXSeeds((previousXSeeds) => {
        const nextXSeeds = produce(previousXSeeds, (draft) => {
          draft[xSeedIndex][cIndex][cPartIndex] = value;
        });
        return nextXSeeds;
      });
    }
  };

  const clear = useCallback(() => {
    setInput([]);
    setOutputs([]);

    if (typeof clearInputAreaPaths.current === "function")
      clearInputAreaPaths.current();

    inputPaper.view.center = new Paper.Point(0, 0);
    outputPaper.view.center = new Paper.Point(0, 0);

    inputPaper.view.scale(
      defaultScaleDownFactor *
        Math.min(inputPaper.view.bounds.right, inputPaper.view.bounds.bottom)
    );

    outputPaper.view.scale(
      defaultScaleDownFactor *
        Math.min(outputPaper.view.bounds.right, outputPaper.view.bounds.bottom)
    );
  }, [setInput, setOutputs]);

  return (
    <StyleProvider>
      <Wrapper>
        <LeftControlsWrapper elevation={3}>
          <XSeedsHeader>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              xSeeds
            </Typography>

            <XSeedsMWrapper>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
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

                <XSeed elevation={0} key={xSeedIndex}>
                  {xSeed.map((c, cIndex) => (
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
                </XSeed>
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
        <CenterControlsWrapper>
          <RunButtonWrapper>
            <RunButton
              size="large"
              color="inherit"
              onClick={process}
              disabled={input.length === 0}
            >
              <StyledFunctions fontSize="inherit" />
            </RunButton>
          </RunButtonWrapper>
          <ClearButtonWrapper>
            <ClearButton onClick={clear}>
              <StyledDelete />
            </ClearButton>
          </ClearButtonWrapper>
        </CenterControlsWrapper>
        <AreasWrapper>
          <AreaWrapper>
            <InputArea
              paper={inputPaper}
              setInput={setInput}
              inputSteps={INPUT_STEPS}
              clearInputAreaPathsRef={clearInputAreaPaths}
            />
          </AreaWrapper>
          <AreaWrapper>
            <OutputArea paper={outputPaper} outputs={outputs} />
          </AreaWrapper>
        </AreasWrapper>
      </Wrapper>
    </StyleProvider>
  );
}

export default App;
