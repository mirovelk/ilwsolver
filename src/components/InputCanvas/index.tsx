import styled from '@emotion/styled';
import Paper from 'paper';
import React, { useEffect, useRef } from 'react';

import draw from '../../support/drawing/draw';

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

interface Props {
  wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  cursorInfoRef: React.MutableRefObject<HTMLDivElement | null>;
}

function InputCanvas({ wrapperRef, cursorInfoRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // init paper.js
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      Paper.setup(canvas);
      draw(wrapperRef, cursorInfoRef);
    }
  }, []);

  return <Canvas ref={canvasRef} id="canvas" data-paper-resize="true" />;
}

export default InputCanvas;
