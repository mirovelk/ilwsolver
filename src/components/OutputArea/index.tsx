import React, { useEffect, useState } from "react";
import Paper from "paper";

import InteractiveCanvas from "../InteractiveCanvas";
import Path from "../paper/Path";
import { ResultInQArray } from "../../support/calc/calc";

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

export interface Output {
  result: ResultInQArray;
  color: paper.Color;
}

interface OutputPaths {
  paths: Array<paper.Point[]>;
  color: paper.Color;
}

type OutputsPaths = OutputPaths[];

function OutputArea({
  paper,
  outputs,
}: {
  paper: paper.PaperScope;
  outputs: Output[];
}) {
  const [points, setPoints] = useState<OutputsPaths>([]);

  // convert ouput Complex array to Path points
  useEffect(() => {
    const outputsPaths = outputs.map((output) => ({
      paths: output.result.map((path) =>
        path.map(([x, y]) => new Paper.Point(x, -y))
      ),
      color: output.color,
    }));
    if (
      outputsPaths.some((outputPaths) =>
        outputPaths.paths.some((path) => path.length > 0)
      )
    ) {
      const allPaths = outputsPaths.flatMap((outputPaths) =>
        outputPaths.paths.flatMap((points) => points)
      );
      viewFitBounds(paper, new Paper.Path(allPaths));
    }
    setPoints(outputsPaths);

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
  }, [paper, outputs]);

  return (
    <>
      <InteractiveCanvas
        paper={paper}
        id="output"
        title="Output"
        controls={<></>}
      />
      {points.map((outputPathsPoints, outputPathsPointsIndex) =>
        outputPathsPoints.paths.map(
          (outputPathPoints, outputPathPointsIndex) => (
            <Path
              key={`${outputPathsPointsIndex}-${outputPathPointsIndex}`}
              paper={paper}
              points={outputPathPoints}
              strokeColor={outputPathsPoints.color}
              strokeWidth={OUTPUT_PATH_WIDTH}
              fullySelected={false}
            />
          )
        )
      )}
    </>
  );
}

export default OutputArea;
