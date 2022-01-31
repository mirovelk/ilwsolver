import styled from "@emotion/styled";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Paper from "paper";

import StyleProvider from "./support/style/StyleProvider";
import InputArea from "./components/InputArea";
import OutputArea from "./components/OutputArea";
import { IconButton, TextField } from "@mui/material";
import { Delete, Functions } from "@mui/icons-material";
import { complex, Complex } from "./util/complex";
import { compute } from "./support/calc/calc";
import { defaultScaleDownFactor, inputPaper, outputPaper } from "./papers";

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

const LeftCenterControlsWrapper = styled.div`
  display: inline-flex;
  position: absolute;
  z-index: 1000;
  top: 80px;
  left: 40px;
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

const INPUT_STEPS = 1000;

function App() {
  const [xSeed, setXSeed] = useState<Complex[]>([complex(1, 2), complex(3, 4)]);
  const [xSeedInput, setXSeedInput] = useState(JSON.stringify(xSeed));
  const [xSeedInputError, setXSeedInputError] = useState(false);
  const [input, setInput] = useState<Complex[]>([]);
  const [output, setOutput] = useState<Complex[][]>([]);

  const clearInputAreaPaths = useRef<() => void>();

  useEffect(() => {
    try {
      const parsedInputValue = JSON.parse(xSeedInput);

      if (
        Array.isArray(parsedInputValue) &&
        parsedInputValue.every(
          (item) =>
            Array.isArray(item) &&
            item.length === 2 &&
            typeof item[0] === "number" &&
            typeof item[1] === "number"
        )
      ) {
        setXSeedInputError(false);
        setXSeed(parsedInputValue);
      } else {
        throw new Error("invalid input");
      }
    } catch {
      setXSeedInputError(true);
    }
  }, [xSeedInput]);

  const process = useCallback(() => {
    const output = compute(input, xSeed);

    console.log(
      JSON.stringify(input).replaceAll("[", "{").replaceAll("]", "}")
    );
    console.log(
      JSON.stringify(output).replaceAll("[", "{").replaceAll("]", "}")
    );

    setOutput(output);
  }, [input, xSeed]);

  const setXSeedOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setXSeedInput(e.currentTarget.value);
  };

  const clear = useCallback(() => {
    setInput([]);
    setOutput([]);

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
  }, [setInput, setOutput]);

  return (
    <StyleProvider>
      <Wrapper>
        <LeftCenterControlsWrapper>
          <TextField
            label="xSeed"
            value={xSeedInput}
            error={xSeedInputError}
            onChange={setXSeedOnChange}
            helperText={xSeedInputError ? "Invalid input" : ""}
          />
        </LeftCenterControlsWrapper>
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
            <OutputArea paper={outputPaper} output={output} />
          </AreaWrapper>
        </AreasWrapper>
      </Wrapper>
    </StyleProvider>
  );
}

export default App;
