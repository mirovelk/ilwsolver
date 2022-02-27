import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { GpsFixed, Settings } from '@mui/icons-material';
import { Checkbox, FormControlLabel, Grid, IconButton, Input, Slider } from '@mui/material';
import Paper, { Color } from 'paper';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { inputStrokeWidth } from '../../papers';
import {
  addInputDrawingPointAction,
  setInputSegmentsAction,
  setInputSimplifyEnabledAction,
  setInputSimplifyToleranceAction,
  setInputValuesAction,
  setInputZoomAction,
  SIMPLIFY_MAX,
  SIMPLIFY_MIN,
  SIMPLIFY_STEP,
} from '../../support/AppStateProvider/reducer';
import useAppDispatch from '../../support/AppStateProvider/useAppDispatch';
import useAppStateBadPoints from '../../support/AppStateProvider/useAppStateBadPoints';
import useAppStateInputDrawingPoints from '../../support/AppStateProvider/useAppStateInputDrawingPoints';
import useAppStateInputSegments from '../../support/AppStateProvider/useAppStateInputSegments';
import useAppStateInputSimplifyTolerance from '../../support/AppStateProvider/useAppStateInputSimplify';
import useAppStateInputZoom from '../../support/AppStateProvider/useAppStateInputZoom';
import { Complex, complex } from '../../util/complex';
import BadPointEditor from '../BadPointEditor';
import InteractiveCanvas from '../InteractiveCanvas';
import Circle from '../paper/Circle';
import Path from '../paper/Path';
import PathWithEnds from '../PathWithEnds';
import SheetTabs from '../SheetTabs';
import XSeedsEditor from '../XSeedsEditor';

/** @jsxImportSource @emotion/react */
const DrawingPath = styled(Path)``;

const ControlsWrapper = styled(Grid)`
  height: 30px;
`;

const drawingPathIsDrawingColor = new Color(1, 0, 0);
const drawingPathIsNotDrawingColor = new Color(0.3, 0.3, 0.3);
const drawingPathIsNotDrawingWidth = 1;

const inputPathColor = new Color(1, 0, 0);

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
  inputSteps,
}: {
  paper: paper.PaperScope;
  inputSteps: number;
}) {
  const { appDispatch } = useAppDispatch();
  const { appStateBadPoints } = useAppStateBadPoints();
  const { appStateInputZoom } = useAppStateInputZoom();
  const { inputSegments } = useAppStateInputSegments();
  const { inputDrawingPoints } = useAppStateInputDrawingPoints();
  const { inputSimplifyTolerance, inputSimplifyEnabled } =
    useAppStateInputSimplifyTolerance();

  const badPoints = useMemo(
    () =>
      appStateBadPoints.map((point) => new Paper.Point(point[0], -point[1])),
    [appStateBadPoints]
  );

  const setZoom = useCallback(
    (zoom: number) => {
      appDispatch(setInputZoomAction(zoom));
    },
    [appDispatch]
  );

  const badPointRadius = useMemo(
    () => (1 / appStateInputZoom) * 2,
    [appStateInputZoom]
  );

  const [xSeedsEditorVisible, setXSeedsEditorVisible] = useState(false);
  const [badPointEditorVisible, setBadPointEditorVisible] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);

  const handleSimplifySliderChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      if (typeof newValue === "number")
        appDispatch(setInputSimplifyToleranceAction(newValue));
    },
    [appDispatch]
  );

  const handleSimplifyInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      appDispatch(
        setInputSimplifyToleranceAction(
          event.target.value === "" ? SIMPLIFY_MIN : Number(event.target.value)
        )
      );
    },
    [appDispatch]
  );

  const handleSimplifyInputBlur = useCallback(() => {
    if (inputSimplifyTolerance < SIMPLIFY_MIN) {
      appDispatch(setInputSimplifyToleranceAction(SIMPLIFY_MIN));
    } else if (inputSimplifyTolerance > SIMPLIFY_MAX) {
      appDispatch(setInputSimplifyToleranceAction(SIMPLIFY_MAX));
    }
  }, [appDispatch, inputSimplifyTolerance]);

  // init paper events
  useEffect(() => {
    const oldOnMouseDown = paper.view.onMouseDown;
    paper.view.onMouseDown = (e: paper.MouseEvent) => {
      if (oldOnMouseDown) oldOnMouseDown(e);
      // @ts-ignore
      if (e.event.buttons === 1) {
        setIsDrawing(true);
        appDispatch(addInputDrawingPointAction(e.point));
      }
    };

    const oldOnMouseDrag = paper.view.onMouseDrag;
    paper.view.onMouseDrag = (e: paper.MouseEvent) => {
      if (oldOnMouseDrag) oldOnMouseDrag(e);
      // @ts-ignore
      if (e.event.buttons === 1) {
        appDispatch(addInputDrawingPointAction(e.point));
      }
    };

    const oldOnMouseUp = paper.view.onMouseUp;
    paper.view.onMouseUp = (e: paper.MouseEvent) => {
      if (oldOnMouseUp) oldOnMouseUp(e);
      setIsDrawing(false);
    };
  }, [paper, appDispatch]);

  // calculate input path on drawing path or other parameter change (after finishing drawing)
  useEffect(() => {
    if (!isDrawing) {
      const path = new Paper.Path(inputDrawingPoints);
      if (inputSimplifyEnabled) {
        const paperTolerance = Math.pow(10, inputSimplifyTolerance);
        path.simplify(paperTolerance);
      }
      appDispatch(setInputSegmentsAction(path.segments));
      appDispatch(setInputValuesAction(getInputFromPath(path, inputSteps)));
    }
  }, [
    inputDrawingPoints,
    isDrawing,
    inputSimplifyEnabled,
    inputSimplifyTolerance,
    inputSteps,
    appDispatch,
  ]);

  const toggleXSeedsEditor = useCallback(() => {
    setXSeedsEditorVisible(
      (previousXSeedsEditorVisible) => !previousXSeedsEditorVisible
    );
  }, []);

  const toggleBadPointEditor = useCallback(() => {
    setBadPointEditorVisible(
      (previousBadPointEditorVisible) => !previousBadPointEditorVisible
    );
  }, []);

  return (
    <>
      {xSeedsEditorVisible && <XSeedsEditor />}
      <InteractiveCanvas
        paper={paper}
        id="input"
        title="Input"
        setZoom={setZoom}
        topControls={
          <>
            <div
              css={css`
                width: 100%;
                display: flex;
                justify-content: space-between;
                position: relative;
              `}
            >
              <SheetTabs />
              <div>
                <IconButton
                  onClick={toggleBadPointEditor}
                  color={badPointEditorVisible ? "primary" : "default"}
                >
                  <GpsFixed />
                </IconButton>
              </div>
              {badPointEditorVisible && (
                <div
                  css={css`
                    position: absolute;
                    z-index: 2000;
                    top: 45px;
                    right: 10px;
                  `}
                >
                  <BadPointEditor />
                </div>
              )}
            </div>
          </>
        }
        bottomControls={
          <ControlsWrapper container spacing={2} alignItems="center">
            <Grid item>
              <IconButton
                onClick={toggleXSeedsEditor}
                color={xSeedsEditorVisible ? "primary" : "default"}
              >
                <Settings />
              </IconButton>
            </Grid>
            <Grid item>
              <FormControlLabel
                label="Simplify"
                control={
                  <Checkbox
                    checked={inputSimplifyEnabled}
                    onChange={() =>
                      appDispatch(
                        setInputSimplifyEnabledAction(!inputSimplifyEnabled)
                      )
                    }
                  />
                }
              />
            </Grid>
            <Grid item xs>
              <Slider
                value={
                  typeof inputSimplifyTolerance === "number"
                    ? inputSimplifyTolerance
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
                value={inputSimplifyTolerance}
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
        points={inputDrawingPoints}
        strokeColor={
          isDrawing ? drawingPathIsDrawingColor : drawingPathIsNotDrawingColor
        }
        strokeWidth={
          isDrawing ? inputStrokeWidth : drawingPathIsNotDrawingWidth
        }
      />
      <PathWithEnds
        paper={paper}
        zoom={appStateInputZoom}
        segments={inputSegments}
        strokeColor={inputPathColor}
        strokeWidth={inputStrokeWidth}
        visible={!isDrawing}
        fullySelected={!isDrawing}
      />
      {/* keep bad points on top */}
      {badPoints.map((point) => (
        <Circle
          paper={paper}
          center={point}
          radius={badPointRadius}
          key={`${point.x},${point.y}`}
        />
      ))}
    </>
  );
}

export default InputArea;
