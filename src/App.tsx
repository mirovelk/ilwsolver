import styled from "@emotion/styled";
import React, { useRef, useState } from "react";
import Paper from "paper";

import StyleProvider from "./support/style/StyleProvider";
import InputArea from "./components/InputArea";
import OutputArea from "./components/OutputArea";
import { IconButton } from "@mui/material";
import { Delete, Functions } from "@mui/icons-material";
import { Complex } from "./util/complex";
import { calc } from "./support/calc/calc";
import {
  defaultScaleDownFactor,
  inputPaper,
  ouputStrokeWidth,
  outputPaper,
} from "./papers";

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

const INPUT_STEP = 1000;

function getInput(inputLayer: paper.Layer): Complex[] {
  const inputPath = inputLayer.lastChild as paper.Path;
  const inputPoints: paper.Point[] = [];
  const steps = INPUT_STEP;
  const step = inputPath.length / steps;
  for (let i = 0; i < inputPath.length; i += step) {
    inputPoints.push(inputPath.getPointAt(i));
  }
  return inputPoints.map((point) => [point.x, -point.y]);
}

async function drawOutputPoints(output: Complex[], outputLayer: paper.Layer) {
  outputLayer.removeChildren();
  const outputSegments = output.map(([x, y]) => new Paper.Segment([x, -y]));
  const outputPath = new Paper.Path();
  outputPath.strokeColor = new Paper.Color(0, 1, 0);
  outputPath.strokeWidth = ouputStrokeWidth;
  outputLayer.addChild(outputPath);

  const animationDurationInS = 0.5;
  const drawBatchSize = Math.ceil(INPUT_STEP / (animationDurationInS * 60));

  console.log("drawBatchSize :>> ", drawBatchSize);

  outputLayer.onFrame = (e: { count: number; time: number; delta: number }) => {
    if (outputSegments.length > 0) {
      const segments = outputSegments.splice(
        0,
        drawBatchSize
      ) as paper.Segment[];
      outputPath.addSegments(segments);
    }
  };
}

function compute(input: Complex[]): Complex[] {
  const output: Complex[] = [[0, 0]]; // initial value

  for (let i = 0; i < input.length; i++) {
    output.push(calc([output[output.length - 1]], input[i])[0]); // for now returning for M === 1
  }

  return output.slice(1);
}

function viewFitBounds(paper: paper.PaperScope, path: paper.Path) {
  const viewBounds = paper.view.bounds;
  const scaleRatio = Math.min(
    viewBounds.width / path.bounds.width,
    viewBounds.height / path.bounds.height
  );
  paper.view.translate(
    new Paper.Point(
      viewBounds.center.x - path.bounds.center.x,
      viewBounds.center.y - path.bounds.center.y
    )
  );
  paper.view.scale(scaleRatio * 0.8);
}

function process(
  inputLayerRef: React.MutableRefObject<paper.Layer | undefined>,
  outputLayerRef: React.MutableRefObject<paper.Layer | undefined>
) {
  if (inputLayerRef.current && outputLayerRef.current) {
    const input = getInput(inputLayerRef.current);

    console.log(
      JSON.stringify(input).replaceAll("[", "{").replaceAll("]", "}")
    );
    const output = compute(input);
    console.log(
      JSON.stringify(output).replaceAll("[", "{").replaceAll("]", "}")
    );

    viewFitBounds(outputPaper, new Paper.Path(output.map(([x, y]) => [x, -y])));
    drawOutputPoints(output, outputLayerRef.current);
  }
}

function clear(
  drawingLayerRef: React.MutableRefObject<paper.Layer | undefined>,
  inputLayerRef: React.MutableRefObject<paper.Layer | undefined>,
  outputLayerRef: React.MutableRefObject<paper.Layer | undefined>,
  setRunDisabled: (disabled: boolean) => void
) {
  if (
    drawingLayerRef.current &&
    inputLayerRef.current &&
    outputLayerRef.current
  ) {
    drawingLayerRef.current.removeChildren();
    inputLayerRef.current.removeChildren();
    outputLayerRef.current.removeChildren();

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

    setRunDisabled(true);
  }
}

function App() {
  const [runDisabled, setRunDisabled] = useState(true);

  const drawingLayerRef = useRef<paper.Layer>();
  const inputLayerRef = useRef<paper.Layer>();
  const outputLayerRef = useRef<paper.Layer>();

  return (
    <StyleProvider>
      <Wrapper>
        <CenterControlsWrapper>
          <RunButtonWrapper>
            <RunButton
              size="large"
              color="inherit"
              onClick={() => process(inputLayerRef, outputLayerRef)}
              disabled={runDisabled}
            >
              <StyledFunctions fontSize="inherit" />
            </RunButton>
          </RunButtonWrapper>
          <ClearButtonWrapper>
            <ClearButton
              onClick={() =>
                clear(
                  drawingLayerRef,
                  inputLayerRef,
                  outputLayerRef,
                  setRunDisabled
                )
              }
            >
              <StyledDelete />
            </ClearButton>
          </ClearButtonWrapper>
        </CenterControlsWrapper>
        <AreasWrapper>
          <AreaWrapper>
            <InputArea
              paper={inputPaper}
              inputLayerRef={inputLayerRef}
              drawingLayerRef={drawingLayerRef}
              setRunDisabled={setRunDisabled}
            />
          </AreaWrapper>
          <AreaWrapper>
            <OutputArea paper={outputPaper} outputLayerRef={outputLayerRef} />
          </AreaWrapper>
        </AreasWrapper>
      </Wrapper>
    </StyleProvider>
  );
}

export default App;
