import React from "react";

import InteractiveCanvas from "../InteractiveCanvas";

function OutputArea({ paper }: { paper: paper.PaperScope }) {
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
