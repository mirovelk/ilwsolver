import Paper from 'paper';
import React, { useCallback, useEffect, useState } from 'react';

import { setOutputZoomAction } from '../../support/AppStateProvider/reducer';
import useAppDispatch from '../../support/AppStateProvider/useAppDispatch';
import useAppStateSolvers from '../../support/AppStateProvider/useAppStateSolvers';
import { ResultInQArray } from '../../support/calc/calc';
import InteractiveCanvas from '../InteractiveCanvas';
import Path from '../paper/Path';

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
  valid: boolean;
}

interface OutputPaths {
  paths: Array<paper.Point[]>;
  color: paper.Color;
  dashed: boolean;
}

type OutputsPaths = OutputPaths[];

function OutputArea({ paper }: { paper: paper.PaperScope }) {
  const { appDispatch } = useAppDispatch();
  const { appStateSolvers } = useAppStateSolvers();

  const setZoom = useCallback(
    (zoom: number) => {
      appDispatch(setOutputZoomAction(zoom));
    },
    [appDispatch]
  );
  const [points, setPoints] = useState<OutputsPaths>([]);

  // convert ouput Complex array to Path points
  useEffect(() => {
    const outputsPaths = appStateSolvers.map((solver, solverIndex) => ({
      paths: (solver?.ouputValues ?? []).map((path) =>
        path.map(([x, y]) => new Paper.Point(x, -y))
      ),
      color: solver.color,
      dashed: !solver.ouputValuesValid,
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
  }, [paper, appStateSolvers]);

  return (
    <>
      <InteractiveCanvas
        paper={paper}
        id="output"
        title="Output"
        setZoom={setZoom}
        topControls={<></>}
        bottomControls={<></>}
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
              dashArray={outputPathsPoints.dashed ? [10, 8] : []}
            />
          )
        )
      )}
    </>
  );
}

export default OutputArea;
