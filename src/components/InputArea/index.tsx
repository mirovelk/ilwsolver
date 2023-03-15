import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Ballot, GpsFixed, Settings } from '@mui/icons-material';
import {
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Input,
  Slider,
} from '@mui/material';
import Konva from 'konva';
import React, { useCallback, useEffect, useState } from 'react';

import { inputStrokeWidth } from '../../const';

import { selectActiveSheetInputSimplifyConfig } from '../../redux/features/sheets/sheetsSlice';
import { StageId } from '../../redux/features/stages/stagesSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { addActiveSheetInputDrawingPoint } from '../../redux/thunks/activeSheet/addActiveSheetInputDrawingPoint';
import { updateActiveSheetQArray } from '../../redux/thunks/activeSheet/updateActiveSheetQArray';
import { setActiveSheetInputSimplifyEnabled } from '../../redux/thunks/setActiveSheetInputSimplifyEnabled';
import { setActiveSheetInputSimplifyTolerance } from '../../redux/thunks/setActiveSheetInputSimplifyTolerance';
import { pointPositionToLayerCoordintes } from '../../util/konva';
import BadPointEditor from '../BadPointEditor';
import SolveConfigEditor from '../CalcConfigEditor';
import InteractiveStage from '../InteractiveStage';
import QPanel from '../QPanel';
import SheetTabs from '../SheetTabs';
import XSeedsEditor from '../XSeedsEditor';
import BadPoints from './BadPoints';
import InputDrawingPointsLine from './InputDrawingPointsLine';
import PreviousSheetQn from './PreviousSheetQn';
import QArrayLine from './QArrayLine';

const ControlsWrapper = styled(Grid)`
  height: 30px;
`;

const inputLineColor = '#ff0000';

enum Panel {
  XSeedEditor = 'XSeedEditorPanel',
  Q = 'QPanel',
  BadPoints = 'BadPointsPanel',
  CalcConfig = 'CalcConfigEditor',
}

function getPanelToggleColor(panel: Panel, activePanel: Panel | undefined) {
  return panel === activePanel ? 'primary' : 'default';
}

const SIMPLIFY_MIN = -5;
const SIMPLIFY_MAX = 5;
const SIMPLIFY_STEP = 0.01;

function InputArea({ inputStageId }: { inputStageId: StageId }) {
  const dispatch = useAppDispatch();

  const { enabled: inputSimplifyEnabled, tolerance: inputSimplifyTolerance } =
    useAppSelector(selectActiveSheetInputSimplifyConfig);

  const [activePanel, setActivePanel] = useState<Panel | undefined>();

  const [isDrawing, setIsDrawing] = useState(false);

  const handleSimplifySliderChange = useCallback(
    (_e: Event, newValue: number | number[]) => {
      if (typeof newValue === 'number') {
        dispatch(setActiveSheetInputSimplifyTolerance(newValue));
      }
    },
    [dispatch]
  );

  const handleSimplifyInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        setActiveSheetInputSimplifyTolerance(
          e.target.value === '' ? SIMPLIFY_MIN : Number(e.target.value)
        )
      );
    },
    [dispatch]
  );

  const handleSimplifyInputBlur = useCallback(() => {
    if (inputSimplifyTolerance < SIMPLIFY_MIN) {
      dispatch(setActiveSheetInputSimplifyTolerance(SIMPLIFY_MIN));
    } else if (inputSimplifyTolerance > SIMPLIFY_MAX) {
      dispatch(setActiveSheetInputSimplifyTolerance(SIMPLIFY_MAX));
    }
  }, [dispatch, inputSimplifyTolerance]);

  // update qArray on siplify config change
  useEffect(() => {
    dispatch(updateActiveSheetQArray());
  }, [dispatch, inputSimplifyEnabled, inputSimplifyTolerance]);

  const dispatchInputDrawingPointFromMouseEvent = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      const pointerPosition = e.currentTarget?.getStage()?.getPointerPosition();

      if (pointerPosition && e.currentTarget) {
        const point = pointPositionToLayerCoordintes(
          pointerPosition,
          e.currentTarget
        );
        dispatch(addActiveSheetInputDrawingPoint([point.x, point.y]));
      }
    },
    [dispatch]
  );

  // start drawing input path on mouse down
  const dataLayerOnMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      if (e.evt.buttons === 1) {
        setIsDrawing(true);
        dispatchInputDrawingPointFromMouseEvent(e);
      }
    },
    [dispatchInputDrawingPointFromMouseEvent]
  );

  // draw input path while moving mouse
  const dataLayerOnMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      if (e.evt.buttons === 1) {
        dispatchInputDrawingPointFromMouseEvent(e);
      }
    },
    [dispatchInputDrawingPointFromMouseEvent]
  );

  // stop drawing input path on mouse up and update qArray
  const dataLayerOnMouseUp = useCallback(
    (_e: Konva.KonvaEventObject<MouseEvent>): void => {
      setIsDrawing(false);
      dispatch(updateActiveSheetQArray()); // make sure to trigger recalculation of qArray
    },
    [dispatch]
  );

  const togglePanel = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if ('panel' in e.currentTarget.dataset) {
      const clickedPanelToggle = e.currentTarget.dataset.panel as Panel;
      setActivePanel((previousActivePanel) =>
        previousActivePanel !== clickedPanelToggle
          ? clickedPanelToggle
          : undefined
      );
    }
  }, []);

  return (
    <>
      {activePanel === Panel.XSeedEditor && <XSeedsEditor />}
      {activePanel === Panel.Q && <QPanel />}
      <InteractiveStage
        title="Input"
        stageId={inputStageId}
        dataLayerOnMouseMove={dataLayerOnMouseMove}
        dataLayerOnMouseDown={dataLayerOnMouseDown}
        dataLayerOnMouseUp={dataLayerOnMouseUp}
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
                  onClick={togglePanel}
                  data-panel={Panel.BadPoints}
                  color={getPanelToggleColor(Panel.BadPoints, activePanel)}
                >
                  <GpsFixed />
                </IconButton>
                <IconButton
                  onClick={togglePanel}
                  data-panel={Panel.CalcConfig}
                  color={getPanelToggleColor(Panel.CalcConfig, activePanel)}
                >
                  <Settings />
                </IconButton>
              </div>
              <div
                css={css`
                  position: absolute;
                  z-index: 2000;
                  top: 45px;
                  right: 0;
                `}
              >
                {activePanel === Panel.BadPoints && <BadPointEditor />}
                {activePanel === Panel.CalcConfig && <SolveConfigEditor />}
              </div>
            </div>
          </>
        }
        bottomControls={
          <ControlsWrapper container spacing={2} alignItems="center">
            <Grid item>
              <IconButton
                onClick={togglePanel}
                data-panel={Panel.XSeedEditor}
                color={getPanelToggleColor(Panel.XSeedEditor, activePanel)}
              >
                <Ballot />
              </IconButton>
              <IconButton
                onClick={togglePanel}
                data-panel={Panel.Q}
                css={css`
                  font-size: 22px;
                  width: 40px;
                  height: 40px;
                `}
                color={getPanelToggleColor(Panel.Q, activePanel)}
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
                      dispatch(
                        setActiveSheetInputSimplifyEnabled(
                          !inputSimplifyEnabled
                        )
                      )
                    }
                  />
                }
              />
            </Grid>
            <Grid item xs>
              <Slider
                value={
                  typeof inputSimplifyTolerance === 'number'
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
                  type: 'number',
                }}
              />
            </Grid>
          </ControlsWrapper>
        }
      >
        <>
          {/* render input drawing points */}
          <InputDrawingPointsLine
            stroke={inputLineColor}
            strokeWidth={inputStrokeWidth}
            isDrawing={isDrawing}
          />
          {/* render line used to generate values */}
          {!isDrawing && (
            <QArrayLine
              stroke={inputLineColor}
              strokeWidth={inputStrokeWidth}
            />
          )}
          {/* render last sheet end point if available */}
          <PreviousSheetQn />
          {/* keep bad points on top */}
          <BadPoints />
        </>
      </InteractiveStage>
    </>
  );
}

export default InputArea;
