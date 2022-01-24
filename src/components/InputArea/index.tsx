import styled from '@emotion/styled';
import {
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { Button, IconButton, Paper as MaterialPaper } from '@mui/material';
import React, { useRef } from 'react';

import { scrollDown, scrollLeft, scrollRight, scrollUp, simplify, zoomIn, zoomOut } from '../../support/drawing/draw';
import InputCanvas from '../InputCanvas';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const OnCanvasControlsWrapper = styled.div`
  position: absolute;
  top: 50px;
  right: 8px;
  padding: 10px 5px;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  transition: all 0.3s;
  opacity: 0.3;
  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.7);
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
`;

function InputArea() {
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);

  return (
    <Wrapper>
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

      <ControlsWrapper>
        <Button onClick={simplify}>Simplify</Button>
      </ControlsWrapper>
      <CanvasWrapper ref={canvasWrapperRef}>
        <InputCanvas wrapperRef={canvasWrapperRef} />
      </CanvasWrapper>
    </Wrapper>
  );
}

export default InputArea;
