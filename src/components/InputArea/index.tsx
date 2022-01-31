import React, { useCallback, useEffect, useState } from "react";
import Paper, { Color } from "paper";

import InteractiveCanvas from "../InteractiveCanvas";
import { Checkbox, FormControlLabel, Grid, Input, Slider } from "@mui/material";
import styled from "@emotion/styled";
import { inputStrokeWidth } from "../../papers";
import { complex, Complex } from "../../util/complex";
import Path from "../paper/Path";

const DrawingPath = styled(Path)``;
const InputPath = styled(Path)``;

const ControlsWrapper = styled(Grid)`
  height: 30px;
`;

const drawingPathIsDrawingColor = new Color(1, 0, 0);
const drawingPathIsNotDrawingColor = new Color(0.3, 0.3, 0.3);
const drawingPathIsNotDrawingWidth = 1;

const inputPathColor = new Color(1, 0, 0);

const SIMPLIFY_INITIAL = 0.003;
const SIMPLIFY_MIN = 0.0001;
const SIMPLIFY_MAX = 0.01;
const SIMPLIFY_STEP = 0.0001;

function getInputFromPath(
  inputPath: paper.Path,
  inputSteps: number
): Complex[] {
  const inputPoints: paper.Point[] = [];
  const step = inputPath.length / inputSteps;
  for (let i = 0; i < inputPath.length; i += step) {
    // can cause +-1 points due to float addition
    inputPoints.push(inputPath.getPointAt(i));
  }
  return inputPoints.map((point) => complex(point.x, -point.y)); // flip y
}

function InputArea({
  paper,
  setInput,
  inputSteps,
  clearInputAreaPathsRef,
}: {
  paper: paper.PaperScope;
  setInput: (input: Complex[]) => void;
  inputSteps: number;
  clearInputAreaPathsRef: React.MutableRefObject<(() => void) | undefined>;
}) {
  const [isDrawing, setIsDrawing] = useState(false);

  const [simplifyEnabled, setSimplifyEnabled] = useState(true);

  const [simplifyTolerance, setSimplifyTolerance] =
    useState<number>(SIMPLIFY_INITIAL);

  const [drawingPathPoints, setDrawingPathPoints] = useState<paper.Point[]>([]);

  const [inputPathSegmnets, setInputPathSegments] = useState<paper.Segment[]>(
    []
  );

  const clearInputAreaPaths = useCallback(() => {
    setDrawingPathPoints([]);
    setInputPathSegments([]);
  }, []);

  // pass clear paths fn
  useEffect(() => {
    clearInputAreaPathsRef.current = clearInputAreaPaths;
  }, [clearInputAreaPathsRef, clearInputAreaPaths]);

  const handleSimplifySliderChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      if (typeof newValue === "number") setSimplifyTolerance(newValue);
    },
    []
  );

  const handleSimplifyInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSimplifyTolerance(
        event.target.value === "" ? SIMPLIFY_MIN : Number(event.target.value)
      );
    },
    []
  );

  const handleSimplifyInputBlur = useCallback(() => {
    if (simplifyTolerance < SIMPLIFY_MIN) {
      setSimplifyTolerance(SIMPLIFY_MIN);
    } else if (simplifyTolerance > SIMPLIFY_MAX) {
      setSimplifyTolerance(SIMPLIFY_MAX);
    }
  }, [simplifyTolerance]);

  // inpit paper events
  useEffect(() => {
    const oldOnMouseDown = paper.view.onMouseDown;
    paper.view.onMouseDown = (e: paper.MouseEvent) => {
      if (oldOnMouseDown) oldOnMouseDown(e);
      // @ts-ignore
      if (e.event.buttons === 1) {
        setIsDrawing(true);
        setDrawingPathPoints((previousDrawingPath) => [
          ...previousDrawingPath,
          e.point,
        ]);
      }
    };

    const oldOnMouseDrag = paper.view.onMouseDrag;
    paper.view.onMouseDrag = (e: paper.MouseEvent) => {
      if (oldOnMouseDrag) oldOnMouseDrag(e);
      // @ts-ignore
      if (e.event.buttons === 1) {
        setDrawingPathPoints((previousDrawingPath) => [
          ...previousDrawingPath,
          e.point,
        ]);
      }
    };

    const oldOnMouseUp = paper.view.onMouseUp;
    paper.view.onMouseUp = (e: paper.MouseEvent) => {
      if (oldOnMouseUp) oldOnMouseUp(e);
      setIsDrawing(false);
    };
  }, [paper]);

  // calculate input path on drawing path or other parameter change (after finishing drawing)
  useEffect(() => {
    if (!isDrawing) {
      const path = new Paper.Path(drawingPathPoints);
      if (simplifyEnabled) {
        path.simplify(simplifyTolerance);
      }
      setInputPathSegments(path.segments);
      setInput(getInputFromPath(path, inputSteps));
    }
  }, [
    drawingPathPoints,
    isDrawing,
    simplifyEnabled,
    simplifyTolerance,
    inputSteps,
    setInput,
  ]);

  return (
    <>
      <InteractiveCanvas
        paper={paper}
        id="input"
        title="Input"
        controls={
          <ControlsWrapper container spacing={2} alignItems="center">
            <Grid item>
              <FormControlLabel
                label="Simplify"
                control={
                  <Checkbox
                    checked={simplifyEnabled}
                    onChange={() => setSimplifyEnabled((previous) => !previous)}
                  />
                }
              />
            </Grid>
            <Grid item xs>
              <Slider
                value={
                  typeof simplifyTolerance === "number"
                    ? simplifyTolerance
                    : SIMPLIFY_MIN
                }
                size="small"
                step={SIMPLIFY_STEP}
                min={SIMPLIFY_MIN}
                max={SIMPLIFY_MAX}
                onChange={handleSimplifySliderChange}
              />
            </Grid>
            <Grid item>
              <Input
                value={simplifyTolerance}
                size="small"
                onChange={handleSimplifyInputChange}
                onBlur={handleSimplifyInputBlur}
                inputProps={{
                  step: SIMPLIFY_STEP,
                  min: SIMPLIFY_MIN,
                  max: SIMPLIFY_MAX,
                  type: "number",
                }}
              />
            </Grid>
          </ControlsWrapper>
        }
      />
      <DrawingPath
        paper={paper}
        points={drawingPathPoints}
        strokeColor={
          isDrawing ? drawingPathIsDrawingColor : drawingPathIsNotDrawingColor
        }
        strokeWidth={
          isDrawing ? inputStrokeWidth : drawingPathIsNotDrawingWidth
        }
      />
      <InputPath
        paper={paper}
        segments={inputPathSegmnets}
        strokeColor={inputPathColor}
        strokeWidth={inputStrokeWidth}
        visible={!isDrawing}
        fullySelected={!isDrawing}
      />
    </>
  );
}

export default InputArea;
