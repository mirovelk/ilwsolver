import React, { useEffect } from "react";

import InteractiveCanvas from "../InteractiveCanvas";

function OutputArea({
  paper,
  outputLayerName,
}: {
  paper: paper.PaperScope;
  outputLayerName: string;
}) {
  useEffect(() => {
    const outputLayer = new paper.Layer();
    outputLayer.name = outputLayerName;
    paper.project.addLayer(outputLayer);
    outputLayer.activate();
  }, [paper, outputLayerName]);

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
