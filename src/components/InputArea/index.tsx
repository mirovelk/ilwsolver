import React, { useEffect } from "react";
import { Color, Path } from "paper";

import InteractiveCanvas from "../InteractiveCanvas";
import { Button } from "@mui/material";
import styled from "@emotion/styled";
import { AutoFixHigh, Delete } from "@mui/icons-material";

const ControlsWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

function simplify(
  inputPathRef: React.MutableRefObject<paper.Path | undefined>
) {
  if (inputPathRef.current) {
    inputPathRef.current.simplify(0.0001);
  }
}

function clear(inputPathRef: React.MutableRefObject<paper.Path | undefined>) {
  if (inputPathRef.current) {
    inputPathRef.current.removeSegments(
      0,
      inputPathRef.current.segments.length
    );
  }
}

function InputArea({
  paper,
  inputPathRef,
}: {
  paper: paper.PaperScope;
  inputPathRef: React.MutableRefObject<paper.Path | undefined>;
}) {
  useEffect(() => {
    console.log("useEffect :>> ");
    if (inputPathRef) {
      inputPathRef.current = new Path();
      inputPathRef.current.strokeColor = new Color(1, 0, 0);
      inputPathRef.current.strokeWidth = 3;

      paper.view.onMouseDown = (e: paper.MouseEvent) => {
        // @ts-ignore
        if (inputPathRef.current && e.event.buttons === 1) {
          inputPathRef.current.selected = false;
          inputPathRef.current.add(e.point);
        }
      };

      paper.view.onMouseDrag = (e: paper.MouseEvent) => {
        // @ts-ignore
        if (inputPathRef.current && e.event.buttons === 1) {
          inputPathRef.current.add(e.point);
        }
      };

      paper.view.onMouseUp = (e: paper.MouseEvent) => {
        if (inputPathRef.current) inputPathRef.current.fullySelected = true;
      };
    }
  }, [paper, inputPathRef]);

  return (
    <InteractiveCanvas
      paper={paper}
      id="input"
      title="Input"
      controls={
        <ControlsWrapper>
          <Button
            onClick={() => simplify(inputPathRef)}
            startIcon={<AutoFixHigh />}
          >
            Simplify
          </Button>

          <Button onClick={() => clear(inputPathRef)} startIcon={<Delete />}>
            Clear
          </Button>
        </ControlsWrapper>
      }
    />
  );
}

export default InputArea;
