import styled from "@emotion/styled";
import { Delete, Functions } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import Paper from "paper";
import { useCallback, useRef, useState } from "react";

import InputArea from "./components/InputArea";
import OutputArea, { Output } from "./components/OutputArea";
import { XSeeds } from "./components/XSeedsEditor";
import { defaultScaleDownFactor, inputPaper, outputPaper } from "./papers";
import { solveInQArray } from "./support/calc/calc";
import StyleProvider from "./support/style/StyleProvider";
import { getColorForIndex } from "./util/color";
import { Complex } from "./util/complex";

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

function getInitialXSeeds(seeds: Complex[][]) {
  return seeds.map((seed, seedIndex) => ({
    seed,
    color: getColorForIndex(seedIndex),
  }));
}

function App() {
  const [xSeeds, setXSeeds] = useState<XSeeds>(
    getInitialXSeeds([
      [
        [2, -3],
        [3, -2],
      ],
      [
        [2, 3],
        [2, 4],
      ],
    ])
  );

  const [input, setInput] = useState<Complex[]>([]);
  const [outputs, setOutputs] = useState<Output[]>([]);

  const clearInputAreaPaths = useRef<() => void>();

  const process = useCallback(() => {
    const results = xSeeds.map((xSeed) =>
      solveInQArray(xSeed.seed as Complex[], input)
    );

    console.log(
      JSON.stringify(input).replaceAll("[", "{").replaceAll("]", "}")
    );
    console.log(
      JSON.stringify(results).replaceAll("[", "{").replaceAll("]", "}")
    );

    const outputs = results.map((result, i) => ({
      result,
      color: xSeeds[i].color,
      valid: true,
    }));

    setOutputs(outputs);
  }, [input, xSeeds]);

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

  const removeOutputAtIndex = useCallback(
    (index: number) => {
      setOutputs((previousOututs) =>
        previousOututs.filter((_, ouputIndex) => ouputIndex !== index)
      );
    },
    [setOutputs]
  );

  const invalidateOutputAtIndex = useCallback(
    (index: number) => {
      setOutputs((previousOututs) =>
        previousOututs.map((output, outputIndex) =>
          outputIndex === index ? { ...output, valid: false } : output
        )
      );
    },
    [setOutputs]
  );

  const removeAllOutputs = useCallback(() => {
    setOutputs([]);
  }, [setOutputs]);

  const invalidateAllOutputs = useCallback(() => {
    setOutputs((previousOututs) =>
      previousOututs.map((output, outputIndex) => ({
        ...output,
        valid: false,
      }))
    );
  }, [setOutputs]);

  return (
    <StyleProvider>
      <Wrapper>
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
              xSeeds={xSeeds}
              setXSeeds={setXSeeds}
              clearInputAreaPathsRef={clearInputAreaPaths}
              removeOutputAtIndex={removeOutputAtIndex}
              invalidateOutputAtIndex={invalidateOutputAtIndex}
              removeAllOutputs={removeAllOutputs}
              invalidateAllOutputs={invalidateAllOutputs}
            />
          </AreaWrapper>
          <AreaWrapper>
            <OutputArea paper={outputPaper} outputs={outputs} xSeeds={xSeeds} />
          </AreaWrapper>
        </AreasWrapper>
      </Wrapper>
    </StyleProvider>
  );
}

export default App;
