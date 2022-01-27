import React, { useRef } from "react";
import styled from "@emotion/styled";
import {
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  ZoomIn,
  ZoomOut,
} from "@mui/icons-material";
import { Button, IconButton, Paper as MaterialPaper } from "@mui/material";

import {
  scrollDown,
  scrollLeft,
  scrollRight,
  scrollUp,
  simplify,
  zoomIn,
  zoomOut,
} from "../../support/drawing/draw";
import InputCanvas from "../InputCanvas";

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const OnCanvasControlsWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  opacity: 0.3;
  z-index: 1000;
  &:hover {
    opacity: 1;
  }
`;

const ZoomButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-around;
`;

const ZoomButton = styled(IconButton)`
  min-width: auto;
  flex: 0 0 auto;
`;

const ScrollButtonsWrapper = styled.div`
  margin-bottom: 10px;
`;

const ScrollButtonWrapper = styled.div`
  display: flex;
  width: 120px;
`;

const SingleScrollButtonWrapper = styled(ScrollButtonWrapper)`
  justify-content: center;
`;

const DoubleScrollButtonWrapper = styled(ScrollButtonWrapper)`
  justify-content: space-between;
`;

const ScrollButton = styled(IconButton)`
  min-width: initial;
`;

const ControlsWrapper = styled.div`
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
`;

const CanvasWrapper = styled(MaterialPaper)`
  flex: 0 1 100%;
  min-height: 1px;
  overflow: hidden;
  position: relative;
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
  left: 20px;
`;

const StatusCursor = styled.div``;

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

function InputArea() {
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const cursorInfoRef = useRef<HTMLDivElement | null>(null);
  const statusCursorRef = useRef<HTMLDivElement | null>(null);
  const statusCursorXValueRef = useRef<HTMLDivElement | null>(null);
  const statusCursorYValueRef = useRef<HTMLDivElement | null>(null);

  return (
    <Wrapper>
      <ControlsWrapper>
        <Button onClick={simplify}>Simplify</Button>
      </ControlsWrapper>
      <CanvasWrapper ref={canvasWrapperRef}>
        <CursorInfo ref={cursorInfoRef} />
        <OnCanvasControlsWrapper>
          <ScrollButtonsWrapper>
            <SingleScrollButtonWrapper>
              <ScrollButton onClick={scrollDown}>
                <KeyboardArrowUp />
              </ScrollButton>
            </SingleScrollButtonWrapper>
            <DoubleScrollButtonWrapper>
              <ScrollButton onClick={scrollRight}>
                <KeyboardArrowLeft />
              </ScrollButton>
              <ScrollButton onClick={scrollLeft}>
                <KeyboardArrowRight />
              </ScrollButton>
            </DoubleScrollButtonWrapper>
            <SingleScrollButtonWrapper>
              <ScrollButton onClick={scrollUp}>
                <KeyboardArrowDown />
              </ScrollButton>
            </SingleScrollButtonWrapper>
          </ScrollButtonsWrapper>
          <ZoomButtonsWrapper>
            <ZoomButton onClick={zoomOut}>
              <ZoomOut />
            </ZoomButton>
            <ZoomButton onClick={zoomIn}>
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
        <InputCanvas
          wrapperRef={canvasWrapperRef}
          cursorInfoRef={cursorInfoRef}
          statusCursorRef={statusCursorRef}
          statusCursorYValueRef={statusCursorXValueRef}
          statusCursorXValueRef={statusCursorYValueRef}
        />
      </CanvasWrapper>
    </Wrapper>
  );
}

export default InputArea;
