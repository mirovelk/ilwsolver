import React, { useEffect, useState } from "react";
import Paper from "paper";
import { Complex } from "../../util/complex";

import InteractiveCanvas from "../InteractiveCanvas";
import Path from "../paper/Path";

const OUTPUT_PATH_COLOR = new Paper.Color(0, 1, 0);
const OUTPUT_PATH_WIDTH = 3;

function viewFitBounds(paper: paper.PaperScope, path: paper.Path) {
  const viewBounds = paper.view.bounds;
  const scaleRatio = Math.min(
    viewBounds.width / path.bounds.width,
    viewBounds.height / path.bounds.height
  );
  paper.view.translate(
    new Paper.Point(
      viewBounds.center.x - path.bounds.center.x,
      viewBounds.center.y - path.bounds.center.y
    )
  );
  paper.view.scale(scaleRatio * 0.8);
}

function OutputArea({
  paper,
  output,
}: {
  paper: paper.PaperScope;
  output: Complex[];
}) {
  const [outputPathPoints, setOutptuPathPoints] = useState<paper.Point[]>([]);

  // convert ouput Complex array to Path points and add with animation
  useEffect(() => {
    const points = output.map(([x, y]) => new Paper.Point(x, -y));
    if (points.length > 0) viewFitBounds(paper, new Paper.Path(points));
    setOutptuPathPoints(points);

    // animation below loses points !!!
    // const animationDurationInS = 0.5;
    // const drawBatchSize = Math.ceil(
    //   points.length / (animationDurationInS * 60)
    // );

    // setOutptuPathPoints([]);

    // paper.view.onFrame = (e: {
    //   count: number;
    //   time: number;
    //   delta: number;
    // }) => {
    //   if (points.length > 0) {
    //     setOutptuPathPoints((previousPoints) => [
    //       ...previousPoints,
    //       ...points.splice(0, drawBatchSize),
    //     ]);
    //   }
    // };
  }, [paper, output]);

  return (
    <>
      <InteractiveCanvas
        paper={paper}
        id="output"
        title="Output"
        controls={<></>}
      />
      <Path
        paper={paper}
        points={outputPathPoints}
        strokeColor={OUTPUT_PATH_COLOR}
        strokeWidth={OUTPUT_PATH_WIDTH}
        fullySelected={true}
      />
    </>
  );
}

export default OutputArea;
