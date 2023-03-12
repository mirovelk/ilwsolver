import { css } from '@emotion/react';
import { Button, ButtonGroup } from '@mui/material';
import chroma from 'chroma-js';
import Konva from 'konva';
import { useCallback } from 'react';
import { ouputStrokeWidth } from '../../const';

import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ResultsInQArray } from '../../core/solve';

import InteractiveStage from '../InteractiveStage';
import LineWithIcons from '../LineWithIcons';
import { StageId } from '../../redux/features/stages/stagesSlice';
import {
  OutputProjectionVariant,
  ResultId,
  selectOutputProjectionVariant,
  toggleResultSelected,
} from '../../redux/features/results/resultsSlice';
import { selectActiveSheetOutputAreaData } from '../../redux/selectors/selectOutputAreaData';
import { activeSheetSelectAllResults } from '../../redux/thunks/activeSheetSelectAllResults';
import { activeSheetSelectSingleResult } from '../../redux/thunks/activeSheetSelectSingleResult copy';
import { setProjectionVariantAndCenterActiveSheetResults } from '../../redux/thunks/setProjectionVariantAndCenterActiveSheetResults';

const dashLength = 10;

export interface Output {
  result: ResultsInQArray;
  valid: boolean;
}

function OutputArea({ outputStageId }: { outputStageId: StageId }) {
  const dispatch = useAppDispatch();

  const { xSeeds: outputAreaXSeeds } = useAppSelector(
    selectActiveSheetOutputAreaData
  );
  const outputProjectionVariant = useAppSelector(selectOutputProjectionVariant);

  const resultLineOnClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>, resultId: ResultId): void => {
      if (e.evt.button === 0) {
        e.cancelBubble = true;
        if (e.evt.shiftKey) {
          dispatch(toggleResultSelected({ resultId }));
        } else {
          e.currentTarget.moveToTop();
          dispatch(activeSheetSelectSingleResult(resultId));
        }
      }
    },
    [dispatch]
  );

  const dataLayerOnClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      if (e.evt.button === 0) {
        if (!e.evt.shiftKey) {
          dispatch(activeSheetSelectAllResults());
        }
      }
    },
    [dispatch]
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
                    setProjectionVariantAndCenterActiveSheetResults(
                      OutputProjectionVariant.V1
                    )
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
                    setProjectionVariantAndCenterActiveSheetResults(
                      OutputProjectionVariant.V2
                    )
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
                    setProjectionVariantAndCenterActiveSheetResults(
                      OutputProjectionVariant.V3
                    )
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
                  resultLineOnClick(e, result.id),
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
