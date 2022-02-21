/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled/macro';
import {
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { IconButton, Paper as MaterialPaper } from '@mui/material';
import React, { useCallback, useEffect, useRef } from 'react';

import {
  initAxis,
  initCoordinates,
  initPanning,
  initZooming,
  scrollDown,
  scrollLeft,
  scrollRight,
  scrollUp,
  updateCursorCoordinatesStatus,
} from './util';

const Title = styled.h2`
  margin: 0 20px 5px 0;
`;

const StyledCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: crosshair;
`;

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
  bottom: 15px;
  left: calc(100% - 250px);
`;

const StatusCursor = styled.div`
  display: none;
`;

const StatusCursorRow = styled.div`
  display: flex;
  &:not(:last-child) {
    margin-bottom: 5px;
  }
`;

const StatusCursorX = styled(StatusCursorRow)``;
const StatusCursorY = styled(StatusCursorRow)``;

const StatusCursorValue = styled.div`
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  padding: 0 5px;
`;

const StatusCursorLabel = styled.div`
  color: rgba(200, 200, 200, 1);
  width: 20px;
`;

const StatusCursorXValue = styled(StatusCursorValue)``;
const StatusCursorYValue = styled(StatusCursorValue)``;

const CanvasWrapper = styled(MaterialPaper)`
  flex: 0 1 100%;
  min-height: 1px;
  overflow: hidden;
  position: relative;

  &:hover {
    ${StatusCursor} {
      display: block;
    }
    ${OnCanvasControlsWrapper} {
      display: flex;
    }
  }
`;

function InteractiveCanvas({
  paper,
  id,
  title,
  topControls,
  bottomControls,
  setZoom,
  children,
}: {
  paper: paper.PaperScope;
  id: string;
  title: string;
  topControls: JSX.Element;
  bottomControls: JSX.Element;
  setZoom: (zoom: number) => void;
  children?: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const cursorInfoRef = useRef<HTMLDivElement | null>(null);
  const statusCursorRef = useRef<HTMLDivElement | null>(null);
  const statusCursorXValueRef = useRef<HTMLDivElement | null>(null);
  const statusCursorYValueRef = useRef<HTMLDivElement | null>(null);

  const zoomStep = 0.8;
  const zoomOut = useCallback(
    (paper: paper.PaperScope) => {
      paper.view.zoom *= zoomStep;
      setZoom(paper.view.zoom);
    },
    [setZoom]
  );

  const zoomIn = useCallback(
    (paper: paper.PaperScope) => {
      paper.view.zoom /= zoomStep;
      setZoom(paper.view.zoom);
    },
    [setZoom]
  );

  // init paper.js
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvasWrapperRef.current) {
      paper.setup(canvas);

      paper.project.currentStyle.strokeScaling = false;

      initCoordinates(paper);
      setZoom(paper.view.zoom); // initial zoom
      initPanning(paper, canvasWrapperRef.current);
      initZooming(paper, canvasWrapperRef.current, setZoom);

      const backgroundLayer = new paper.Layer();
      initAxis(backgroundLayer);
      paper.project.addLayer(backgroundLayer);

      paper.view.onMouseDrag = (e: paper.MouseEvent) => {
        if (
          statusCursorXValueRef.current &&
          statusCursorYValueRef.current &&
          // @ts-ignore
          e.event.buttons === 1
        ) {
          updateCursorCoordinatesStatus(
            e,
            statusCursorXValueRef.current,
            statusCursorYValueRef.current
          );
        }
      };

      paper.view.onMouseMove = (e: paper.MouseEvent) => {
        if (statusCursorXValueRef.current && statusCursorYValueRef.current) {
          updateCursorCoordinatesStatus(
            e,
            statusCursorXValueRef.current,
            statusCursorYValueRef.current
          );
        }
      };

      paper.view.onResize = () => {
        if (canvasWrapperRef.current) {
          const wrapperWidth = canvasWrapperRef.current.clientWidth;
          const wrapperHeight = canvasWrapperRef.current.clientHeight;
          paper.view.viewSize.width = wrapperWidth;
          paper.view.viewSize.height = wrapperHeight;
        }
      };
    }
  }, [paper, setZoom]);

  return (
    <Wrapper>
      <div>
        <div
          css={css`
            height: 35px;
            margin-bottom: 5px;
            display: flex;
          `}
        >
          <Title>{title}</Title>
          {topControls}
        </div>
        <div
          css={css`
            height: 35px;
            margin-bottom: 15px;
            display: flex;
          `}
        >
          {bottomControls}
        </div>
      </div>

      <CanvasWrapper ref={canvasWrapperRef}>
        <CursorInfo ref={cursorInfoRef} />
        <OnCanvasControlsWrapper>
          <ScrollButtonsWrapper>
            <DoubleScrollButtonWrapper>
              <ScrollButton onClick={() => scrollRight(paper)}>
                <KeyboardArrowLeft />
              </ScrollButton>
              <ScrollButton onClick={() => scrollLeft(paper)}>
                <KeyboardArrowRight />
              </ScrollButton>
            </DoubleScrollButtonWrapper>
            <DoubleScrollButtonWrapper>
              <ScrollButton onClick={() => scrollUp(paper)}>
                <KeyboardArrowDown />
              </ScrollButton>
              <ScrollButton onClick={() => scrollDown(paper)}>
                <KeyboardArrowUp />
              </ScrollButton>
            </DoubleScrollButtonWrapper>
          </ScrollButtonsWrapper>
          <ZoomButtonsWrapper>
            <ZoomButton onClick={() => zoomOut(paper)}>
              <ZoomOut />
            </ZoomButton>
            <ZoomButton onClick={() => zoomIn(paper)}>
              <ZoomIn />
            </ZoomButton>
          </ZoomButtonsWrapper>
        </OnCanvasControlsWrapper>
        <StatusLine>
          <StatusCursor ref={statusCursorRef}>
            <StatusCursorX>
              <StatusCursorLabel>x: </StatusCursorLabel>
              <StatusCursorXValue ref={statusCursorXValueRef} />
            </StatusCursorX>
            <StatusCursorY>
              <StatusCursorLabel>y: </StatusCursorLabel>
              <StatusCursorYValue ref={statusCursorYValueRef} />
            </StatusCursorY>
          </StatusCursor>
        </StatusLine>
        <StyledCanvas
          ref={canvasRef}
          id={`canvas-${id}`}
          data-paper-resize="true"
        />
        {children}
      </CanvasWrapper>
    </Wrapper>
  );
}

export default InteractiveCanvas;
