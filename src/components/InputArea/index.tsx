import styled from '@emotion/styled';
import {
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { Button, ButtonGroup, Paper as MaterialPaper } from '@mui/material';
import React, { useRef } from 'react';

import { scrollDown, scrollLeft, scrollRight, scrollUp, simplify, zoomIn, zoomOut } from '../../support/drawing/draw';
import InputCanvas from '../InputCanvas';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
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
      <ControlsWrapper>
        <Button onClick={simplify}>Simplify</Button>
        <ButtonGroup>
          <Button onClick={scrollDown}>
            <KeyboardArrowUp />
          </Button>
          <Button onClick={scrollUp}>
            <KeyboardArrowDown />
          </Button>
          <Button onClick={scrollRight}>
            <KeyboardArrowLeft />
          </Button>
          <Button onClick={scrollLeft}>
            <KeyboardArrowRight />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button onClick={zoomIn}>
            <ZoomIn />
          </Button>
          <Button onClick={zoomOut}>
            <ZoomOut />
          </Button>
        </ButtonGroup>
      </ControlsWrapper>
      <CanvasWrapper ref={canvasWrapperRef}>
        <InputCanvas wrapperRef={canvasWrapperRef} />
      </CanvasWrapper>
    </Wrapper>
  );
}

export default InputArea;
