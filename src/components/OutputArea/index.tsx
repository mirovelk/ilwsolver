import React, { useEffect } from "react";

import InteractiveCanvas from "../InteractiveCanvas";

function OutputArea({
  paper,
  outputLayerRef,
}: {
  paper: paper.PaperScope;
  outputLayerRef: React.MutableRefObject<paper.Layer | undefined>;
}) {
  useEffect(() => {
    outputLayerRef.current = new paper.Layer();
    paper.project.addLayer(outputLayerRef.current);
  }, [paper, outputLayerRef]);

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
