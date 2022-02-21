import Paper from 'paper';
import React, { useCallback, useEffect, useState } from 'react';

import { setOutputZoomAction } from '../../support/AppStateProvider/reducer';
import useAppDispatch from '../../support/AppStateProvider/useAppDispatch';
import useAppStateOutputZoom from '../../support/AppStateProvider/useAppStateOutputZoom';
import useAppStateSolvers from '../../support/AppStateProvider/useAppStateSolvers';
import { ResultInQArray } from '../../support/calc/calc';
import InteractiveCanvas from '../InteractiveCanvas';
import PathWithEnds from '../PathWithEnds';

const OUTPUT_PATH_WIDTH = 3;

function viewFitBounds(
  paper: paper.PaperScope,
  path: paper.Path,
  setZoom: (zoom: number) => void
) {
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
  setZoom(paper.view.zoom);
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
  const { appStateOutputZoom } = useAppStateOutputZoom();

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
      viewFitBounds(paper, new Paper.Path(allPaths), setZoom);
    }
    setPoints(outputsPaths);
  }, [paper, appStateSolvers, setZoom]);

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
            <PathWithEnds
              key={`${outputPathsPointsIndex}-${outputPathPointsIndex}`}
              paper={paper}
              zoom={appStateOutputZoom}
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
