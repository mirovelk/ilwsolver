import React, { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import Paper from "paper";

import draw from "../../support/drawing/draw";

const StyledCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: crosshair;
`;

interface Props {
  wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  cursorInfoRef: React.MutableRefObject<HTMLDivElement | null>;
  statusCursorRef: React.MutableRefObject<HTMLDivElement | null>;
  statusCursorXValueRef: React.MutableRefObject<HTMLDivElement | null>;
  statusCursorYValueRef: React.MutableRefObject<HTMLDivElement | null>;
}

function InputCanvas({
  wrapperRef,
  cursorInfoRef,
  statusCursorRef,
  statusCursorXValueRef,
  statusCursorYValueRef,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // init paper.js
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      Paper.setup(canvas);
      if (
        wrapperRef.current &&
        cursorInfoRef.current &&
        statusCursorRef.current &&
        statusCursorXValueRef.current &&
        statusCursorYValueRef.current
      ) {
        draw(
          wrapperRef.current,
          cursorInfoRef.current,
          statusCursorRef.current,
          statusCursorXValueRef.current,
          statusCursorYValueRef.current
        );
      }
    }
  }, [
    wrapperRef,
    cursorInfoRef,
    statusCursorRef,
    statusCursorXValueRef,
    statusCursorYValueRef,
  ]);

  return <StyledCanvas ref={canvasRef} id="canvas" data-paper-resize="true" />;
}

export default InputCanvas;
