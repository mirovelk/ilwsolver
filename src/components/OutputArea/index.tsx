import { css } from '@emotion/react';
import { Button, ButtonGroup } from '@mui/material';
import chroma from 'chroma-js';
import Konva from 'konva';
import { useCallback } from 'react';
import { ouputStrokeWidth } from '../../const';

import {
  selectOutputAreaData,
  selectAllXSeedResults,
  selectSingleXSeedResult,
  setOutputProjectionVariant,
  toggleXSeedResultSelected,
  selectOutputProjectionVariant,
} from '../../redux/features/app/appSlice';
import {
  StageId,
  OutputProjectionVariant,
  XSeedId,
} from '../../redux/features/app/types';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ResultsInQArray } from '../../core/solve';

import InteractiveStage from '../InteractiveStage';
import LineWithIcons from '../LineWithIcons';

const dashLength = 10;

export interface Output {
  result: ResultsInQArray;
  valid: boolean;
}

function OutputArea({ outputStageId }: { outputStageId: StageId }) {
  const dispatch = useAppDispatch();

  const { xSeeds: outputAreaXSeeds } = useAppSelector(selectOutputAreaData);
  const outputProjectionVariant = useAppSelector(selectOutputProjectionVariant);

  const resultLineOnClick = useCallback(
    (
      e: Konva.KonvaEventObject<MouseEvent>,
      xSeedId: XSeedId,
      resultIndex: number
    ): void => {
      if (e.evt.button === 0) {
        e.cancelBubble = true;
        if (e.evt.shiftKey) {
          dispatch(toggleXSeedResultSelected({ xSeedId, resultIndex }));
        } else {
          e.currentTarget.moveToTop();
          dispatch(selectSingleXSeedResult({ xSeedId, resultIndex }));
        }
      }
    },
    [dispatch]
  );

  const dataLayerOnClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      if (e.evt.button === 0) {
        if (!e.evt.shiftKey) {
          dispatch(
            selectAllXSeedResults({
              xSeedIds: outputAreaXSeeds.map((xSeed) => xSeed.id),
            })
          );
        }
      }
    },
    [dispatch, outputAreaXSeeds]
  );

  const resultLineOnMouseEnter = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      const stage = e.target.getStage();
      if (stage) {
        stage.container().style.cursor = 'pointer';
      }
    },
    []
  );

  const resultLineOnMouseLeave = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      const stage = e.target.getStage();
      if (stage) {
        stage.container().style.cursor = 'inherit';
      }
    },
    []
  );

  return (
    <>
      <InteractiveStage
        title="Output"
        stageId={outputStageId}
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
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() =>
                  dispatch(
                    setOutputProjectionVariant(OutputProjectionVariant.V1)
                  )
                }
              >
                x
              </Button>
              <Button
                variant={
                  outputProjectionVariant === OutputProjectionVariant.V2
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() =>
                  dispatch(
                    setOutputProjectionVariant(OutputProjectionVariant.V2)
                  )
                }
              >
                x + 6/(1 - q)
              </Button>
              <Button
                variant={
                  outputProjectionVariant === OutputProjectionVariant.V3
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() =>
                  dispatch(
                    setOutputProjectionVariant(OutputProjectionVariant.V3)
                  )
                }
              >
                (1 - q) * x
              </Button>
            </ButtonGroup>
          </div>
        }
        bottomControls={<></>}
        dataLayerOnClick={dataLayerOnClick}
      >
        {outputAreaXSeeds.map((xSeed, xSeedIndex) =>
          xSeed.results.map((result, resultIndex) => (
            <LineWithIcons
              key={`${xSeedIndex}-${resultIndex}`}
              points={result.projectedValues.flatMap((value) => value)}
              stroke={
                result.selected
                  ? xSeed.color
                  : chroma(xSeed.color).desaturate().darken().hex()
              }
              strokeWidth={
                result.selected ? ouputStrokeWidth : ouputStrokeWidth - 1
              }
              lineCap="round"
              lineJoin="round"
              dash={
                !xSeed.resultsValid || !result.selected
                  ? [dashLength, dashLength]
                  : []
              }
              strokeScaleEnabled={false}
              hitStrokeWidth={ouputStrokeWidth + 10}
              groupProps={{
                onClick: (e: Konva.KonvaEventObject<MouseEvent>) =>
                  resultLineOnClick(e, xSeed.id, resultIndex),
                onMouseEnter: resultLineOnMouseEnter,
                onMouseLeave: resultLineOnMouseLeave,
              }}
            />
          ))
        )}
      </InteractiveStage>
    </>
  );
}

export default OutputArea;
