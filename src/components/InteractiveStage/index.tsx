import styled from '@emotion/styled';
import {
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { IconButton, Paper as MaterialPaper } from '@mui/material';
import Konva from 'konva';
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { Circle, Layer, Line, Rect, Stage } from 'react-konva';
import {
  panStageDataLayer,
  resizeStage,
  scaleStageDataLayer,
  selectStageById,
  StageId,
  updateStageDataLayerPosition,
  zoomStageDataLayerWithWheel,
} from '../../redux/features/stages/stagesSlice';

import { useAppDispatch, useAppSelector } from '../../redux/store';
import { pointPositionToLayerCoordintes } from '../../util/konva';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const OnCanvasControlsWrapper = styled.div`
  display: none;
  position: absolute;
  top: 10px;
  right: 30px;
  transition: all 0.3s;
  opacity: 0.3;
  z-index: 1000;

  &:hover {
    opacity: 1;
  }
`;

const ZoomButtonsWrapper = styled.div`
  display: flex;
`;

const ZoomButton = styled(IconButton)`
  min-width: auto;
  flex: 0 0 auto;
`;

const ScrollButtonsWrapper = styled.div`
  display: flex;
`;

const DoubleScrollButtonWrapper = styled.div`
  display: flex;
  margin-right: 10px;
`;

const ScrollButton = styled(IconButton)`
  min-width: initial;
`;

const CursorInfo = styled.div`
  position: absolute;
  display: inline-block;
  border-radius: 4px;
  padding: 2px 6px;
  white-space: nowrap;
`;

const StatusLine = styled.div`
  position: absolute;
  z-index: 99999999;
  bottom: 15px;
  left: calc(100% - 250px);
`;

const PointerStatus = styled.div`
  display: none;
`;

const PointerStatusRow = styled.div`
  display: flex;

  &:not(:last-child) {
    margin-bottom: 5px;
  }
`;

const PointerStatusRowX = styled(PointerStatusRow)``;
const PointerStatusRowY = styled(PointerStatusRow)``;

const PointerStatusRowValue = styled.div`
  background: rgb(0 0 0 / 70%);
  border-radius: 4px;
  padding: 0 5px;
`;

const PointerStatusRowLabel = styled.div`
  color: rgb(200 200 200);
  width: 20px;
`;

const PointerStatusRowXValue = styled(PointerStatusRowValue)``;
const PointerStatusRowYValue = styled(PointerStatusRowValue)``;

const StageWrapper = styled(MaterialPaper)`
  flex: 1 0 0;
  min-width: 0;
  overflow: hidden;
  position: relative;

  &:hover {
    ${PointerStatus} {
      display: block;
    }

    ${OnCanvasControlsWrapper} {
      display: flex;
    }
  }
`;

const dataLayerButtonZoomStep = 0.8;
const dataLayerButtonScrollSteps = 5;
const dataLayerAxisLength = 1_000_000; // too large value causes safari issues

function InteractiveStage({
  stageId,
  children,
  dataLayerOnClick: dataLayerOnClickProp,
  dataLayerOnMouseMove: dataLayerOnMouseMoveProp,
  dataLayerOnMouseDown: dataLayerOnMouseDownProp,
  dataLayerOnMouseUp: dataLayerOnMouseUpProp,
}: {
  stageId: StageId;
  children?: React.ReactNode;
  dataLayerOnClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  dataLayerOnMouseMove?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  dataLayerOnMouseDown?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  dataLayerOnMouseUp?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}) {
  const stageWrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  const hoverTargetRef = useRef<EventTarget | null>(null);

  const dispatch = useAppDispatch();

  const stage = useAppSelector((state) => selectStageById(state, stageId));

  const updateStageSize = useCallback(() => {
    const stageWrapper = stageWrapperRef.current;
    if (stageWrapper) {
      dispatch(
        resizeStage({
          id: stageId,
          stageWidth: stageWrapper.clientWidth,
          stageHeight: stageWrapper.clientHeight,
        })
      );
    }
  }, [dispatch, stageId]);

  // set Konva drag button to right mouse button
  useEffect(() => {
    Konva.dragButtons = [2];
  }, []);

  // resize canvas when window size changes
  useEffect(() => {
    window.addEventListener('resize', updateStageSize);
    return () => {
      window.removeEventListener('resize', updateStageSize);
    };
  }, [updateStageSize]);

  // initial canvas size setup
  useLayoutEffect(() => {
    updateStageSize();
  }, [updateStageSize]);

  const dataLayerOnMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // update cursor and prevet default context menu
      if (e.evt.button === 2) {
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = 'grab';
        }
      }

      dataLayerOnMouseDownProp?.(e);
    },
    [dataLayerOnMouseDownProp]
  );

  const dataLayerOnMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const pointerPosition = e.currentTarget.getStage()?.getPointerPosition();
      if (
        pointerPosition &&
        statusCursorXValueRef.current &&
        statusCursorYValueRef.current
      ) {
        const cursorPoint = pointPositionToLayerCoordintes(
          pointerPosition,
          e.currentTarget
        );

        statusCursorXValueRef.current.innerHTML = cursorPoint.x.toString();
        statusCursorYValueRef.current.innerHTML = cursorPoint.y.toString();
      }

      dataLayerOnMouseMoveProp?.(e);
    },
    [dataLayerOnMouseMoveProp]
  );

  const dataLayerOnMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      dataLayerOnMouseUpProp?.(e);
    },
    [dataLayerOnMouseUpProp]
  );

  const dataLayerOnClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      dataLayerOnClickProp?.(e);
    },
    [dataLayerOnClickProp]
  );

  const dataLayerOnDragStart = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      // update cusrsor
      const stage = e.target.getStage();
      if (stage) {
        stage.container().style.cursor = 'grabbing';
      }
    },
    []
  );

  const dataLayerOnDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      // update position
      dispatch(
        updateStageDataLayerPosition({
          id: stageId,
          x: e.target.x(),
          y: e.target.y(),
        })
      );
    },
    [dispatch, stageId]
  );

  // change cursor on drag end
  const dataLayerOnDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      // update cusrsor
      const stage = e.target.getStage();
      if (stage) {
        stage.container().style.cursor = 'crosshair';
      }
      // update position
      dispatch(
        updateStageDataLayerPosition({
          id: stageId,
          x: e.target.x(),
          y: e.target.y(),
        })
      );
    },
    [dispatch, stageId]
  );

  // zoom on scroll
  const dataLayerOnWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const pointer = e.target.getStage()?.getPointerPosition();
      if (pointer) {
        dispatch(
          zoomStageDataLayerWithWheel({
            id: stageId,
            wheelDeltaY: e.evt.deltaY,
            pointerX: pointer.x,
            pointerY: pointer.y,
          })
        );
      }
    },
    [dispatch, stageId]
  );

  const dataLayerZoomIn = useCallback(() => {
    dispatch(
      scaleStageDataLayer({
        id: stageId,
        scaleFactor: 1 / dataLayerButtonZoomStep,
      })
    );
  }, [dispatch, stageId]);

  const dataLayerZoomOut = useCallback(() => {
    dispatch(
      scaleStageDataLayer({
        id: stageId,
        scaleFactor: dataLayerButtonZoomStep,
      })
    );
  }, [dispatch, stageId]);

  const dataLayerScrollLeft = useCallback(() => {
    const minSize = Math.min(stage.width, stage.height);
    dispatch(
      panStageDataLayer({
        id: stageId,
        panX: minSize / dataLayerButtonScrollSteps,
      })
    );
  }, [dispatch, stage.width, stage.height, stageId]);

  const dataLayerScrollRight = useCallback(() => {
    const minSize = Math.min(stage.width, stage.height);
    dispatch(
      panStageDataLayer({
        id: stageId,
        panX: -minSize / dataLayerButtonScrollSteps,
      })
    );
  }, [dispatch, stage.width, stage.height, stageId]);

  const dataLayerScrollUp = useCallback(() => {
    const minSize = Math.min(stage.width, stage.height);
    dispatch(
      panStageDataLayer({
        id: stageId,
        panY: -minSize / dataLayerButtonScrollSteps,
      })
    );
  }, [dispatch, stage.width, stage.height, stageId]);

  const dataLayerScrollDown = useCallback(() => {
    const minSize = Math.min(stage.width, stage.height);
    dispatch(
      panStageDataLayer({
        id: stageId,
        panY: minSize / dataLayerButtonScrollSteps,
      })
    );
  }, [dispatch, stage.width, stage.height, stageId]);

  // pan layer with arrow keys and zoom with + and - keys when mouse is over canvas
  useEffect(() => {
    function handlemouseOver(e: MouseEvent) {
      hoverTargetRef.current = e.target;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (hoverTargetRef.current === stageRef.current?.content.firstChild) {
        e.preventDefault();

        if (e.key === 'ArrowUp') {
          dataLayerScrollUp();
        }
        if (e.key === 'ArrowDown') {
          dataLayerScrollDown();
        }
        if (e.key === 'ArrowLeft') {
          dataLayerScrollLeft();
        }
        if (e.key === 'ArrowRight') {
          dataLayerScrollRight();
        }
        if (e.key === '+') {
          dataLayerZoomIn();
        }
        if (e.key === '-') {
          dataLayerZoomOut();
        }
      }
    }

    document.addEventListener('mouseover', handlemouseOver);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mouseover', handlemouseOver);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    dataLayerScrollDown,
    dataLayerScrollLeft,
    dataLayerScrollRight,
    dataLayerScrollUp,
    dataLayerZoomIn,
    dataLayerZoomOut,
    dispatch,
    stageId,
  ]);

  const stageOnContextMenu = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
    },
    []
  );

  const statusCursorXValueRef = useRef<HTMLDivElement | null>(null);
  const statusCursorYValueRef = useRef<HTMLDivElement | null>(null);

  return (
    <Wrapper>
      <StageWrapper ref={stageWrapperRef}>
        <CursorInfo />
        <OnCanvasControlsWrapper>
          <ScrollButtonsWrapper>
            <DoubleScrollButtonWrapper>
              <ScrollButton onClick={() => dataLayerScrollLeft()}>
                <KeyboardArrowLeft />
              </ScrollButton>
              <ScrollButton onClick={() => dataLayerScrollRight()}>
                <KeyboardArrowRight />
              </ScrollButton>
            </DoubleScrollButtonWrapper>
            <DoubleScrollButtonWrapper>
              <ScrollButton onClick={() => dataLayerScrollUp()}>
                <KeyboardArrowDown />
              </ScrollButton>
              <ScrollButton onClick={() => dataLayerScrollDown()}>
                <KeyboardArrowUp />
              </ScrollButton>
            </DoubleScrollButtonWrapper>
          </ScrollButtonsWrapper>
          <ZoomButtonsWrapper>
            <ZoomButton onClick={() => dataLayerZoomOut()}>
              <ZoomOut />
            </ZoomButton>
            <ZoomButton onClick={() => dataLayerZoomIn()}>
              <ZoomIn />
            </ZoomButton>
          </ZoomButtonsWrapper>
        </OnCanvasControlsWrapper>
        <StatusLine>
          <PointerStatus>
            <PointerStatusRowX>
              <PointerStatusRowLabel>x: </PointerStatusRowLabel>
              <PointerStatusRowXValue ref={statusCursorXValueRef} />
            </PointerStatusRowX>
            <PointerStatusRowY>
              <PointerStatusRowLabel>y: </PointerStatusRowLabel>
              <PointerStatusRowYValue ref={statusCursorYValueRef} />
            </PointerStatusRowY>
          </PointerStatus>
        </StatusLine>
        {stage.dataLayer.intialized && (
          <Stage
            width={stage.width}
            height={stage.height}
            onContextMenu={stageOnContextMenu}
            ref={stageRef}
          >
            {/* data layer */}
            <Layer
              scaleX={stage.dataLayer.scale}
              scaleY={-stage.dataLayer.scale} // flip y
              x={stage.dataLayer.x}
              y={stage.dataLayer.y}
              draggable
              onDragStart={dataLayerOnDragStart}
              onDragMove={dataLayerOnDragMove}
              onDragEnd={dataLayerOnDragEnd}
              onWheel={dataLayerOnWheel}
              onClick={dataLayerOnClick}
              onMouseDown={dataLayerOnMouseDown}
              onMouseMove={dataLayerOnMouseMove}
              onMouseUp={dataLayerOnMouseUp}
            >
              {/* axis */}
              <Rect
                x={-1}
                y={-1}
                width={2}
                height={2}
                stroke="#383838"
                strokeWidth={1}
                strokeScaleEnabled={false}
              />
              <Circle
                x={0}
                y={0}
                radius={1}
                stroke="#515151"
                strokeWidth={1}
                strokeScaleEnabled={false}
              />
              <Line
                points={[-dataLayerAxisLength, 0, dataLayerAxisLength, 0]}
                stroke="#999999"
                strokeWidth={1}
                strokeScaleEnabled={false}
              />
              <Line
                points={[0, -dataLayerAxisLength, 0, dataLayerAxisLength]}
                stroke="#999999"
                strokeWidth={1}
                strokeScaleEnabled={false}
              />
              {/* transparent background to be able to drag the whole layer */}
              <Rect
                x={Number.MIN_SAFE_INTEGER / 2}
                y={Number.MIN_SAFE_INTEGER / 2}
                width={Number.MAX_SAFE_INTEGER}
                height={Number.MAX_SAFE_INTEGER}
                fill="transparent"
              />
              {/* children must be last to render above other elements */}
              {children}
            </Layer>
          </Stage>
        )}
      </StageWrapper>
    </Wrapper>
  );
}

export default InteractiveStage;
