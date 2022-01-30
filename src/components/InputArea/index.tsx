import React, { useEffect, useState } from "react";
import Paper, { Color } from "paper";

import InteractiveCanvas from "../InteractiveCanvas";
import { Checkbox, FormControlLabel, Grid, Input, Slider } from "@mui/material";
import styled from "@emotion/styled";
import { inputStrokeWidth } from "../../papers";

const ControlsWrapper = styled(Grid)`
  height: 30px;
`;

const roughPathDrawingColor = new Color(1, 0, 0);
const roughPathRestingColor = new Color(0.3, 0.3, 0.3);
const roughPathRestingWidth = 1;

function processDrawing(
  drawingLayerRef: React.MutableRefObject<paper.Layer | undefined>,
  inputLayerRef: React.MutableRefObject<paper.Layer | undefined>,
  simplifyEnabled: boolean,
  simplifyTolerance: number,
  setRunDisabled: (disabled: boolean) => void
) {
  if (inputLayerRef.current && drawingLayerRef.current) {
    setRunDisabled(true);
    const roughInputPath = drawingLayerRef.current.lastChild as paper.Path;

    if (roughInputPath && roughInputPath.segments.length > 0) {
      inputLayerRef.current.removeChildren();

      const inputPath = new Paper.Path(roughInputPath.segments);
      inputPath.strokeColor = new Color(1, 0, 0);
      inputPath.strokeWidth = inputStrokeWidth;
      if (simplifyEnabled) {
        inputPath.simplify(simplifyTolerance);
      }
      inputPath.fullySelected = true;
      inputLayerRef.current.addChild(inputPath);

      roughInputPath.strokeColor = roughPathRestingColor;
      roughInputPath.strokeWidth = roughPathRestingWidth;
      inputLayerRef.current.visible = true;
    }
    setRunDisabled(false);
  }
}

const SIMPLIFY_INITIAL = 0.003;
const SIMPLIFY_MIN = 0.0001;
const SIMPLIFY_MAX = 0.01;
const SIMPLIFY_STEP = 0.0001;

function InputArea({
  paper,
  drawingLayerRef,
  inputLayerRef,
  setRunDisabled,
}: {
  paper: paper.PaperScope;
  drawingLayerRef: React.MutableRefObject<paper.Layer | undefined>;
  inputLayerRef: React.MutableRefObject<paper.Layer | undefined>;
  setRunDisabled: (disabled: boolean) => void;
}) {
  const [simplifyEnabled, setSimplifyEnabled] = useState(true);

  const [simplifyTolerance, setSimplifyTolerance] =
    React.useState<number>(SIMPLIFY_INITIAL);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") setSimplifyTolerance(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSimplifyTolerance(
      event.target.value === "" ? SIMPLIFY_MIN : Number(event.target.value)
    );
  };

  const handleBlur = () => {
    if (simplifyTolerance < SIMPLIFY_MIN) {
      setSimplifyTolerance(SIMPLIFY_MIN);
    } else if (simplifyTolerance > SIMPLIFY_MAX) {
      setSimplifyTolerance(SIMPLIFY_MAX);
    }
  };

  // init
  useEffect(() => {
    drawingLayerRef.current = new paper.Layer();
    paper.project.addLayer(drawingLayerRef.current);

    inputLayerRef.current = new paper.Layer();
    paper.project.addLayer(inputLayerRef.current);
  }, [paper, inputLayerRef, drawingLayerRef]);

  // onMouseDown
  useEffect(() => {
    paper.view.onMouseDown = (e: paper.MouseEvent) => {
      if (inputLayerRef.current && drawingLayerRef.current) {
        // @ts-ignore
        if (e.event.buttons === 1) {
          inputLayerRef.current.visible = false;
          if (!drawingLayerRef.current.hasChildren()) {
            const roughInputPath = new Paper.Path();
            roughInputPath.strokeColor = roughPathDrawingColor;
            roughInputPath.strokeWidth = inputStrokeWidth;
            roughInputPath.add(e.point);
            drawingLayerRef.current.addChild(roughInputPath);
          } else {
            const roughInputPath = drawingLayerRef.current
              .lastChild as paper.Path;
            roughInputPath.strokeColor = roughPathDrawingColor;
            roughInputPath.strokeWidth = inputStrokeWidth;
            roughInputPath.add(e.point);
          }
        }
      }
    };
  }, [drawingLayerRef, inputLayerRef, paper.view]);

  // onMouseDrag
  useEffect(() => {
    paper.view.onMouseDrag = (e: paper.MouseEvent) => {
      if (drawingLayerRef.current) {
        // @ts-ignore
        if (e.event.buttons === 1) {
          const roughInputPath = drawingLayerRef.current
            .lastChild as paper.Path;
          roughInputPath.add(e.point);
        }
      }
    };
  }, [drawingLayerRef, paper.view]);

  // onMouseUp
  useEffect(() => {
    paper.view.onMouseUp = (e: paper.MouseEvent) => {
      // @ts-ignore
      if (e.event.button === 0) {
        processDrawing(
          drawingLayerRef,
          inputLayerRef,
          simplifyEnabled,
          simplifyTolerance,
          setRunDisabled
        );
      }
    };
  }, [
    paper,
    drawingLayerRef,
    inputLayerRef,
    setRunDisabled,
    simplifyEnabled,
    simplifyTolerance,
  ]);

  // udapre automatically on checkbox change
  useEffect(() => {
    processDrawing(
      drawingLayerRef,
      inputLayerRef,
      simplifyEnabled,
      simplifyTolerance,
      setRunDisabled
    );
  }, [
    drawingLayerRef,
    inputLayerRef,
    setRunDisabled,
    simplifyEnabled,
    simplifyTolerance,
  ]);

  return (
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
              onChange={handleSliderChange}
            />
          </Grid>
          <Grid item>
            <Input
              value={simplifyTolerance}
              size="small"
              onChange={handleInputChange}
              onBlur={handleBlur}
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
  );
}

export default InputArea;
