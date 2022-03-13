/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button, ButtonGroup } from '@mui/material';
import Paper from 'paper';
import React, { useCallback, useEffect, useState } from 'react';

import {
  OutputProjectionVariant,
  setOutputProjectionVariantAction,
  setOutputZoomAction,
} from '../../support/AppStateProvider/reducer';
import useAppDispatch from '../../support/AppStateProvider/useAppDispatch';
import useAppStateInputValues from '../../support/AppStateProvider/useAppStateInputValues';
import useAppStateOutputProjectionVariant from '../../support/AppStateProvider/useAppStateOutputProjectionVariant';
import useAppStateOutputZoom from '../../support/AppStateProvider/useAppStateOutputZoom';
import useAppStateSolvers from '../../support/AppStateProvider/useAppStateSolvers';
import { ResultInQArray } from '../../support/calc/calc';
import { add, Complex, complex, divide, multiply, subtract } from '../../util/complex';
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

const complexOne = complex(1);
const complexSix = complex(6);

function projectV2(x: Complex, q: Complex): Complex {
  return divide(add(x, complexSix), subtract(complexOne, q));
}

function projectV3(x: Complex, q: Complex): Complex {
  return multiply(subtract(complexOne, q), x);
}

function valueToProjectedValue(
  x: Complex,
  q: Complex,
  projectionVariant: OutputProjectionVariant
): Complex {
  switch (projectionVariant) {
    case OutputProjectionVariant.V1:
      return x;
    case OutputProjectionVariant.V2:
      return projectV2(x, q);
    case OutputProjectionVariant.V3:
      return projectV3(x, q);
    default:
      return x;
  }
}

function valueToPoint(x: Complex): paper.Point {
  return new Paper.Point(x[0], -x[1]);
}

function OutputArea({ paper }: { paper: paper.PaperScope }) {
  const { appDispatch } = useAppDispatch();
  const { appStateSolvers } = useAppStateSolvers();
  const { appStateInputValues } = useAppStateInputValues();
  const { outputProjectionVariant } = useAppStateOutputProjectionVariant();

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
        path.map((value, valueIndex) =>
          valueToPoint(
            valueToProjectedValue(
              value,
              appStateInputValues[valueIndex],
              outputProjectionVariant
            )
          )
        )
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
  }, [
    paper,
    appStateSolvers,
    setZoom,
    appStateInputValues,
    outputProjectionVariant,
  ]);

  return (
    <>
      <InteractiveCanvas
        paper={paper}
        id="output"
        title="Output"
        setZoom={setZoom}
        topControls={
          <div
            css={css`
              display: flex;
              justify-content: flex-end;
              width: 100%;
            `}
          >
            <ButtonGroup>
              <Button
                variant={
                  outputProjectionVariant === OutputProjectionVariant.V1
                    ? "contained"
                    : "outlined"
                }
                onClick={() =>
                  appDispatch(
                    setOutputProjectionVariantAction(OutputProjectionVariant.V1)
                  )
                }
              >
                x
              </Button>
              <Button
                variant={
                  outputProjectionVariant === OutputProjectionVariant.V2
                    ? "contained"
                    : "outlined"
                }
                onClick={() =>
                  appDispatch(
                    setOutputProjectionVariantAction(OutputProjectionVariant.V2)
                  )
                }
              >
                x + 6/(1 - q)
              </Button>
              <Button
                variant={
                  outputProjectionVariant === OutputProjectionVariant.V3
                    ? "contained"
                    : "outlined"
                }
                onClick={() =>
                  appDispatch(
                    setOutputProjectionVariantAction(OutputProjectionVariant.V3)
                  )
                }
              >
                (1 - q) * x
              </Button>
            </ButtonGroup>
          </div>
        }
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

export default React.memo(OutputArea);
