/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Ballot, GpsFixed } from '@mui/icons-material';
import { Checkbox, FormControlLabel, Grid, IconButton, Input, Slider } from '@mui/material';
import Paper, { Color } from 'paper';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { inputStrokeWidth } from '../../papers';
import {
  addInputDrawingPoint,
  selectActiveSheetInputSimplifyConfig,
  selectActiveSheetIputDrawingPoints,
  selectBadPoints,
  selectInputZoom,
  selectPreviousSheetEndInputValue,
  setInputSimplifyEnabled,
  setInputSimplifyTolerance,
  setInputValues,
  setInputZoom,
} from '../../redux/features/app/appSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { Complex, complex } from '../../util/complex';
import BadPointEditor from '../BadPointEditor';
import InteractiveCanvas from '../InteractiveCanvas';
import Circle from '../paper/Circle';
import Path from '../paper/Path';
import Rectangle from '../paper/Rectangle';
import PathWithEnds from '../PathWithEnds';
import QPanel from '../QPanel';
import SheetTabs from '../SheetTabs';
import XSeedsEditor from '../XSeedsEditor';

const DrawingPath = styled(Path)``;

const ControlsWrapper = styled(Grid)`
  height: 30px;
`;

const drawingPathIsDrawingColor = new Color(1, 0, 0);
const drawingPathIsNotDrawingColor = new Color(0.3, 0.3, 0.3);
const drawingPathIsNotDrawingWidth = 1;

const previousSheetEndPointRectangleColor = new Color(0, 1, 1);

const inputPathColor = new Color(1, 0, 0);

enum Panel {
  XSeedEditorPanel,
  QPanel,
}

function getInputValuesFromPath(
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

const SIMPLIFY_MIN = -10;
const SIMPLIFY_MAX = 10;
const SIMPLIFY_STEP = 0.0001;

function InputArea({
  paper,
  inputSteps,
}: {
  paper: paper.PaperScope;
  inputSteps: number;
}) {
  const dispatch = useAppDispatch();

  const badPoints = useAppSelector(selectBadPoints);
  const inputZoom = useAppSelector(selectInputZoom);
  const inputDrawingPoints = useAppSelector(selectActiveSheetIputDrawingPoints);
  const { enabled: inputSimplifyEnabled, tolerance: inputSimplifyTolerance } =
    useAppSelector(selectActiveSheetInputSimplifyConfig);
  const previousSheetEndInputValue = useAppSelector(
    selectPreviousSheetEndInputValue
  );

  const [inputSegments, setInputSegments] = useState<paper.Segment[]>([]);

  const previousSheetEndPoint = useMemo(
    () =>
      previousSheetEndInputValue
        ? new Paper.Point([
            previousSheetEndInputValue[0],
            -previousSheetEndInputValue[1],
          ])
        : undefined,
    [previousSheetEndInputValue]
  );

  const previousSheetEndPointSize = useMemo(
    () => (1 / inputZoom) * 5,
    [inputZoom]
  );
  const previousSheetEndPointRectangle = useMemo(
    () =>
      previousSheetEndPoint
        ? new paper.Rectangle({
            point: previousSheetEndPoint.subtract(
              previousSheetEndPointSize / 2
            ),
            size: [previousSheetEndPointSize, previousSheetEndPointSize],
          })
        : undefined,
    [paper.Rectangle, previousSheetEndPoint, previousSheetEndPointSize]
  );

  const badPaperPoints = useMemo(
    () => badPoints.map((point) => new Paper.Point(point[0], -point[1])),
    [badPoints]
  );

  const setZoom = useCallback(
    (zoom: number) => {
      dispatch(setInputZoom(zoom));
    },
    [dispatch]
  );

  const badPointRadius = useMemo(() => (1 / inputZoom) * 2, [inputZoom]);

  const [visiblePanel, setVisiblePanel] = useState<Panel | undefined>(
    undefined
  );
  const [badPointEditorVisible, setBadPointEditorVisible] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);

  const handleSimplifySliderChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      if (typeof newValue === "number")
        dispatch(setInputSimplifyTolerance(newValue));
    },
    [dispatch]
  );

  const handleSimplifyInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        setInputSimplifyTolerance(
          event.target.value === "" ? SIMPLIFY_MIN : Number(event.target.value)
        )
      );
    },
    [dispatch]
  );

  const handleSimplifyInputBlur = useCallback(() => {
    if (inputSimplifyTolerance < SIMPLIFY_MIN) {
      dispatch(setInputSimplifyTolerance(SIMPLIFY_MIN));
    } else if (inputSimplifyTolerance > SIMPLIFY_MAX) {
      dispatch(setInputSimplifyTolerance(SIMPLIFY_MAX));
    }
  }, [dispatch, inputSimplifyTolerance]);

  // init paper events
  useEffect(() => {
    const oldOnMouseDown = paper.view.onMouseDown;
    paper.view.onMouseDown = (e: paper.MouseEvent) => {
      if (oldOnMouseDown) oldOnMouseDown(e);
      // @ts-ignore
      if (e.event.buttons === 1) {
        setIsDrawing(true);
        dispatch(addInputDrawingPoint(e.point));
      }
    };

    const oldOnMouseDrag = paper.view.onMouseDrag;
    paper.view.onMouseDrag = (e: paper.MouseEvent) => {
      if (oldOnMouseDrag) oldOnMouseDrag(e);
      // @ts-ignore
      if (e.event.buttons === 1) {
        dispatch(addInputDrawingPoint(e.point));
      }
    };

    const oldOnMouseUp = paper.view.onMouseUp;
    paper.view.onMouseUp = (e: paper.MouseEvent) => {
      if (oldOnMouseUp) oldOnMouseUp(e);
      setIsDrawing(false);
    };
  }, [paper, dispatch]);

  // calculate input path on drawing path or other parameter change (after finishing drawing)
  useEffect(() => {
    if (!isDrawing) {
      const path = new Paper.Path(inputDrawingPoints);
      if (inputSimplifyEnabled) {
        const paperTolerance = Math.pow(10, inputSimplifyTolerance);
        path.simplify(paperTolerance);
      }
      setInputSegments(path.segments);
      dispatch(setInputValues(getInputValuesFromPath(path, inputSteps)));
    }
  }, [
    inputDrawingPoints,
    isDrawing,
    inputSimplifyEnabled,
    inputSimplifyTolerance,
    inputSteps,
    dispatch,
  ]);

  const toggleXSeedsEditor = useCallback(() => {
    setVisiblePanel((previousVisiblePanel) =>
      previousVisiblePanel !== Panel.XSeedEditorPanel
        ? Panel.XSeedEditorPanel
        : undefined
    );
  }, []);

  const toggleQPanel = useCallback(() => {
    setVisiblePanel((previousVisiblePanel) =>
      previousVisiblePanel !== Panel.QPanel ? Panel.QPanel : undefined
    );
  }, []);

  const toggleBadPointEditor = useCallback(() => {
    setBadPointEditorVisible(
      (previousBadPointEditorVisible) => !previousBadPointEditorVisible
    );
  }, []);

  return (
    <>
      {visiblePanel === Panel.XSeedEditorPanel && <XSeedsEditor />}
      {visiblePanel === Panel.QPanel && <QPanel />}
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
                color={
                  visiblePanel === Panel.XSeedEditorPanel
                    ? "primary"
                    : "default"
                }
              >
                <Ballot />
              </IconButton>
              <IconButton
                onClick={toggleQPanel}
                css={css`
                  font-size: 22px;
                  width: 40px;
                  height: 40px;
                `}
                color={visiblePanel === Panel.QPanel ? "primary" : "default"}
              >
                q
              </IconButton>
            </Grid>
            <Grid item>
              <FormControlLabel
                label="Simplify"
                control={
                  <Checkbox
                    checked={inputSimplifyEnabled}
                    onChange={() =>
                      dispatch(setInputSimplifyEnabled(!inputSimplifyEnabled))
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

      {previousSheetEndPointRectangle && (
        <Rectangle
          paper={paper}
          rectangle={previousSheetEndPointRectangle}
          fillColor={previousSheetEndPointRectangleColor}
        />
      )}

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
        zoom={inputZoom}
        segments={inputSegments}
        strokeColor={inputPathColor}
        strokeWidth={inputStrokeWidth}
        visible={!isDrawing}
        fullySelected={!isDrawing}
      />
      {/* keep bad points on top */}
      {badPaperPoints.map((point) => (
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
