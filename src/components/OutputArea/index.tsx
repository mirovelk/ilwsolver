import React, { useEffect } from "react";

import InteractiveCanvas from "../InteractiveCanvas";

function OutputArea({
  paper,
  outputPathRef,
}: {
  paper: paper.PaperScope;
  outputPathRef: React.MutableRefObject<paper.Path | undefined>;
}) {
  useEffect(() => {
    if (outputPathRef) {
      outputPathRef.current = new paper.Path();
      outputPathRef.current.strokeColor = new paper.Color(0, 1, 0);
      outputPathRef.current.strokeWidth = 3;
    }
  }, [paper, outputPathRef]);

  return (
    <InteractiveCanvas
      paper={paper}
      id="output"
      title="Output"
      controls={<></>}
    />
  );
}

export default OutputArea;
