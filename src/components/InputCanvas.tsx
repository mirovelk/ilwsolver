import React, { useEffect, useRef } from "react";

import { Button, Paper as MaterialPaper } from "@mui/material";
import Paper from "paper";
import draw from "./draw";
import styled from "@emotion/styled";

const StyledMaterialPaper = styled(MaterialPaper)`
  height: 100%;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

function InputCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      Paper.setup(canvas);
      draw();
    }
  }, [canvasRef]);

  return (
    <StyledMaterialPaper>
      <Canvas ref={canvasRef} id="canvas" data-paper-resize="true" />
    </StyledMaterialPaper>
  );
}

export default InputCanvas;
