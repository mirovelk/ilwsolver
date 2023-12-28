import Konva from 'konva';
import { useCallback, useEffect } from 'react';

import { inputStrokeWidth } from '../../../const';
import {
  selectIsDrawing,
  stopDrawing,
} from '../../../redux/features/sheetInputDrawing/sheetInputDrawingSlice';

import {
  DrawingPoint,
  selectActiveSheetInputSimplifyConfig,
  selectActiveSheetInputStageId,
} from '../../../redux/features/sheets/sheetsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { addActiveSheetInputDrawingPoint } from '../../../redux/thunks/activeSheet/addActiveSheetInputDrawingPoint';
import { updateActiveSheetQArray } from '../../../redux/thunks/activeSheet/updateActiveSheetQArray';

import { pointPositionToLayerCoordintes } from '../../../util/konva';
import InteractiveStage from '../../InteractiveStage';

import BadPoints from './BadPoints';
import InputDrawingPointsLine from './InputDrawingPointsLine';
import PreviousSheetQn from './PreviousSheetQn';
import QArrayLine from './QArrayLine';
import { invalidateActiveSheetXSeedsAndStartDrawing } from '../../../redux/features/sheetInputDrawing/thunks/activeSheetStartDrawing';

const inputLineColor = '#ff0000';

function inputDrawingPointFromMouseEvent(
  e: Konva.KonvaEventObject<MouseEvent>
): DrawingPoint | undefined {
  const pointerPosition = e.currentTarget?.getStage()?.getPointerPosition();

  if (pointerPosition && e.currentTarget) {
    const point = pointPositionToLayerCoordintes(
      pointerPosition,
      e.currentTarget
    );
    return [point.x, point.y];
  }
}

function InputAreaStage() {
  const dispatch = useAppDispatch();

  const inputStageId = useAppSelector(selectActiveSheetInputStageId);
  const isDrawing = useAppSelector(selectIsDrawing);

  const { enabled: inputSimplifyEnabled, tolerance: inputSimplifyTolerance } =
    useAppSelector(selectActiveSheetInputSimplifyConfig);

  // update qArray on siplify config change
  useEffect(() => {
    dispatch(updateActiveSheetQArray());
  }, [dispatch, inputSimplifyEnabled, inputSimplifyTolerance]);

  // start drawing input path on mouse down
  const dataLayerOnMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      if (e.evt.buttons === 1) {
        const inputDrawingPoint = inputDrawingPointFromMouseEvent(e);
        if (!inputDrawingPoint) return;
        dispatch(invalidateActiveSheetXSeedsAndStartDrawing());
        dispatch(addActiveSheetInputDrawingPoint(inputDrawingPoint));
      }
    },
    [dispatch]
  );

  // draw input path while moving mouse
  const dataLayerOnMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      if (e.evt.buttons === 1) {
        const inputDrawingPoint = inputDrawingPointFromMouseEvent(e);
        if (!inputDrawingPoint) return;
        dispatch(addActiveSheetInputDrawingPoint(inputDrawingPoint));
      }
    },
    [dispatch]
  );

  // stop drawing input path on mouse up and update qArray
  const dataLayerOnMouseUp = useCallback(
    (_e: Konva.KonvaEventObject<MouseEvent>): void => {
      dispatch(stopDrawing());
      dispatch(updateActiveSheetQArray()); // make sure to trigger recalculation of qArray
    },
    [dispatch]
  );

  return (
    <InteractiveStage
      stageId={inputStageId}
      dataLayerOnMouseMove={dataLayerOnMouseMove}
      dataLayerOnMouseDown={dataLayerOnMouseDown}
      dataLayerOnMouseUp={dataLayerOnMouseUp}
    >
      <>
        {/* render input drawing points */}
        <InputDrawingPointsLine
          stroke={inputLineColor}
          strokeWidth={inputStrokeWidth}
        />
        {/* render line used to generate values */}
        {!isDrawing && (
          <QArrayLine stroke={inputLineColor} strokeWidth={inputStrokeWidth} />
        )}
        {/* render last sheet end point if available */}
        <PreviousSheetQn />
        {/* keep bad points on top */}
        <BadPoints />
      </>
    </InteractiveStage>
  );
}

export default InputAreaStage;
