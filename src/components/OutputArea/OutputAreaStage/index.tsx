import chroma from 'chroma-js';
import Konva from 'konva';
import { useCallback } from 'react';
import { ouputStrokeWidth } from '../../../const';

import { useAppDispatch, useAppSelector } from '../../../redux/store';

import InteractiveStage from '../../InteractiveStage';
import LineWithIcons from '../../LineWithIcons';
import {
  ResultId,
  toggleResultSelected,
} from '../../../redux/features/results/resultsSlice';
import { selectActiveSheetOutputAreaData } from '../../../redux/selectors/selectOutputAreaData';
import { activeSheetSelectAllResults } from '../../../redux/thunks/activeSheet/activeSheetSelectAllResults';
import { activeSheetSelectSingleResult } from '../../../redux/thunks/activeSheet/activeSheetSelectSingleResult copy';
import { selectActiveSheetOutputStageId } from '../../../redux/features/sheets/sheetsSlice';

const dashLength = 10;

function OutputAreaStage() {
  const outputStageId = useAppSelector(selectActiveSheetOutputStageId);
  const dispatch = useAppDispatch();

  const { xSeeds: outputAreaXSeeds } = useAppSelector(
    selectActiveSheetOutputAreaData
  );

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
    <InteractiveStage
      stageId={outputStageId}
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
  );
}

export default OutputAreaStage;
