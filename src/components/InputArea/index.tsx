import React, { useEffect, useState } from "react";
import Paper, { Color } from "paper";

import InteractiveCanvas from "../InteractiveCanvas";
import { Button } from "@mui/material";
import styled from "@emotion/styled";
import { AutoFixHigh } from "@mui/icons-material";
import { inputStrokeWidth } from "../../papers";

const ControlsWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

function simplify(inputPath: paper.Path) {
  inputPath.simplify(0.0001);
}

function InputArea({
  paper,
  drawingLayerName,
  inputLayerName,
}: {
  paper: paper.PaperScope;
  drawingLayerName: string;
  inputLayerName: string;
}) {
  // const [simplifyEnabled, setSimplifyEnabeld] = useState(true);
  useEffect(() => {
    const drawingLayer = new paper.Layer();
    drawingLayer.name = drawingLayerName;
    paper.project.addLayer(drawingLayer);

    const inputLayer = new paper.Layer();
    inputLayer.name = inputLayerName;
    paper.project.addLayer(inputLayer);
    inputLayer.activate(); // should be active for reading values eslewhere

    const roughPathDrawingColor = new Color(1, 0, 0);
    const roughPathRestingColor = new Color(0.3, 0.3, 0.3);
    const roughPathRestingWidth = 1;

    paper.view.onMouseDown = (e: paper.MouseEvent) => {
      // @ts-ignore
      if (e.event.buttons === 1) {
        if (!drawingLayer.hasChildren()) {
          const roughInputPath = new Paper.Path();
          roughInputPath.strokeColor = roughPathDrawingColor;
          roughInputPath.strokeWidth = inputStrokeWidth;
          //roughInputPath.selected = false;
          roughInputPath.add(e.point);
          drawingLayer.addChild(roughInputPath);
        } else {
          const roughInputPath = drawingLayer.lastChild as paper.Path;
          //roughInputPath.selected = false;
          roughInputPath.add(e.point);
        }
      }
    };

    paper.view.onMouseDrag = (e: paper.MouseEvent) => {
      // @ts-ignore
      if (e.event.buttons === 1) {
        const roughInputPath = drawingLayer.lastChild as paper.Path;
        roughInputPath.add(e.point);
      }
    };

    paper.view.onMouseUp = (e: paper.MouseEvent) => {
      const roughInputPath = drawingLayer.lastChild as paper.Path;

      //roughInputPath.fullySelected = true;

      inputLayer.removeChildren();

      const inputPath = new Paper.Path(roughInputPath.segments);
      inputPath.strokeColor = new Color(1, 0, 0);
      inputPath.strokeWidth = inputStrokeWidth;
      inputPath.simplify(0.0001);
      inputPath.fullySelected = true;
      inputLayer.addChild(inputPath);

      roughInputPath.strokeColor = roughPathRestingColor;
      roughInputPath.strokeWidth = roughPathRestingWidth;
    };
  }, [paper, inputLayerName, drawingLayerName]);

  return (
    <InteractiveCanvas
      paper={paper}
      id="input"
      title="Input"
      controls={
        <ControlsWrapper>
          <Button
            onClick={() =>
              simplify(paper.project.activeLayer.lastChild as paper.Path)
            }
            startIcon={<AutoFixHigh />}
          >
            Simplify
          </Button>
        </ControlsWrapper>
      }
    />
  );
}

export default InputArea;
