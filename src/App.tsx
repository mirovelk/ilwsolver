import styled from "@emotion/styled";
import React, { useRef } from "react";
import Paper, { Color } from "paper";

import StyleProvider from "./support/style/StyleProvider";
import InputArea from "./components/InputArea";
import OutputArea from "./components/OutputArea";
import { Button, IconButton } from "@mui/material";
import { Delete, PlayArrow } from "@mui/icons-material";
import { Complex } from "./util/complex";
import { calc } from "./support/calc/calc";
import { sleep } from "./util/sleep";

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

const StyledPlayArrow = styled(PlayArrow)`
  color: rgb(18, 18, 18);
`;

const RunButton = styled(IconButton)`
  background: rgb(144, 202, 249);
  border: 10px solid rgb(18, 18, 18);
  &:hover {
    background-color: rgb(66, 165, 245);
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

function getInput(
  inputPathRef: React.MutableRefObject<paper.Path | undefined>
): Complex[] {
  const inputPoints: paper.Point[] = [];
  if (inputPathRef.current) {
    const steps = 1000;
    const step = inputPathRef.current?.length / steps;
    for (let i = 0; i < inputPathRef.current?.length; i += step) {
      inputPoints.push(inputPathRef.current?.getPointAt(i));
    }
  }
  return inputPoints.map((point) => [point.x, -point.y]);
}

async function drawOutputPoints(
  output: Complex[],
  outputPathRef: React.MutableRefObject<paper.Path | undefined>
) {
  if (outputPathRef.current) {
    outputPathRef.current.removeSegments(
      0,
      outputPathRef.current.segments.length
    );
    for (let i = 0; i < output.length - 1; i++) {
      await sleep(1);
      outputPathRef.current.add(output[i]);
    }
  }
}

function compute(input: Complex[]): Complex[] {
  // const output: Complex[] = input.map(([x, y]) => [x, -y]);

  const output: Complex[] = [[0, 0]]; // initial value

  for (let i = 0; i < input.length; i++) {
    output.push(calc([output[output.length - 1]], input[i])[0]); // for now returning for M === 1
  }

  return output.slice(1).map(([x, y]) => [x, -y]);
}

function process(
  inputPathRef: React.MutableRefObject<paper.Path | undefined>,
  outputPathRef: React.MutableRefObject<paper.Path | undefined>,
  outputPaperRef: React.MutableRefObject<paper.PaperScope | undefined>
) {
  const input = getInput(inputPathRef);

  console.log(JSON.stringify(input).replaceAll("[", "{").replaceAll("]", "}"));
  const output = compute(input);
  console.log(JSON.stringify(output).replaceAll("[", "{").replaceAll("]", "}"));

  viewFitBounds(outputPaperRef, new Paper.Path(output.map(([x, y]) => [x, y])));

  drawOutputPoints(output, outputPathRef);
}

function clear(
  inputPathRef: React.MutableRefObject<paper.Path | undefined>,
  outputPathRef: React.MutableRefObject<paper.Path | undefined>
) {
  if (inputPathRef.current) {
    inputPathRef.current.removeSegments(
      0,
      inputPathRef.current.segments.length
    );
  }

  if (outputPathRef.current) {
    outputPathRef.current.removeSegments(
      0,
      outputPathRef.current.segments.length
    );
  }
}

function viewFitBounds(
  paperRef: React.MutableRefObject<paper.PaperScope | undefined>,
  path: paper.Path
) {
  if (paperRef.current) {
    const viewBounds = paperRef.current.view.bounds;
    const scaleRatio = Math.min(
      viewBounds.width / path.bounds.width,
      viewBounds.height / path.bounds.height
    );
    paperRef.current.view.translate(
      new Paper.Point(
        viewBounds.center.x - path.bounds.center.x,
        viewBounds.center.y - path.bounds.center.y
      )
    );
    paperRef.current.view.scale(scaleRatio * 0.8);
  }
}

function App() {
  const inputPaperRef = useRef(new Paper.PaperScope());
  const outputPaperRef = useRef(new Paper.PaperScope());

  const inputPathRef = useRef<paper.Path>();
  const outputPathRef = useRef<paper.Path>();

  return (
    <StyleProvider>
      <Wrapper>
        <CenterControlsWrapper>
          <RunButtonWrapper>
            <RunButton
              size="large"
              color="inherit"
              onClick={() =>
                process(inputPathRef, outputPathRef, outputPaperRef)
              }
            >
              <StyledPlayArrow fontSize="inherit" />
            </RunButton>
          </RunButtonWrapper>
          <ClearButtonWrapper>
            <ClearButton
              onClick={() => clear(inputPathRef, outputPathRef)}
              size="small"
            >
              <StyledDelete fontSize="inherit" />
            </ClearButton>
          </ClearButtonWrapper>
        </CenterControlsWrapper>
        <AreasWrapper>
          <AreaWrapper>
            <InputArea
              paper={inputPaperRef.current}
              inputPathRef={inputPathRef}
            />
          </AreaWrapper>
          <AreaWrapper>
            <OutputArea
              paper={outputPaperRef.current}
              outputPathRef={outputPathRef}
            />
          </AreaWrapper>
        </AreasWrapper>
      </Wrapper>
    </StyleProvider>
  );
}

export default App;
