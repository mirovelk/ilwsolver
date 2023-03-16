import Konva from 'konva';
import { useCallback, useEffect, useState } from 'react';

import { inputStrokeWidth } from '../../const';

import { selectActiveSheetInputSimplifyConfig } from '../../redux/features/sheets/sheetsSlice';
import { StageId } from '../../redux/features/stages/stagesSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { addActiveSheetInputDrawingPoint } from '../../redux/thunks/activeSheet/addActiveSheetInputDrawingPoint';
import { updateActiveSheetQArray } from '../../redux/thunks/activeSheet/updateActiveSheetQArray';

import { pointPositionToLayerCoordintes } from '../../util/konva';
import InteractiveStage from '../InteractiveStage';

import BadPoints from './BadPoints';
import InputDrawingPointsLine from './InputDrawingPointsLine';
import PreviousSheetQn from './PreviousSheetQn';
import QArrayLine from './QArrayLine';
import InputTopControls from './InputTopControls';
import InputBottomControls from './InputBottomControls';

const inputLineColor = '#ff0000';

function InputArea({ inputStageId }: { inputStageId: StageId }) {
  const dispatch = useAppDispatch();

  const { enabled: inputSimplifyEnabled, tolerance: inputSimplifyTolerance } =
    useAppSelector(selectActiveSheetInputSimplifyConfig);

  const [isDrawing, setIsDrawing] = useState(false);

  // update qArray on siplify config change
  useEffect(() => {
    dispatch(updateActiveSheetQArray());
  }, [dispatch, inputSimplifyEnabled, inputSimplifyTolerance]);

  const dispatchInputDrawingPointFromMouseEvent = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      const pointerPosition = e.currentTarget?.getStage()?.getPointerPosition();

      if (pointerPosition && e.currentTarget) {
        const point = pointPositionToLayerCoordintes(
          pointerPosition,
          e.currentTarget
        );
        dispatch(addActiveSheetInputDrawingPoint([point.x, point.y]));
      }
    },
    [dispatch]
  );

  // start drawing input path on mouse down
  const dataLayerOnMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      if (e.evt.buttons === 1) {
        setIsDrawing(true);
        dispatchInputDrawingPointFromMouseEvent(e);
      }
    },
    [dispatchInputDrawingPointFromMouseEvent]
  );

  // draw input path while moving mouse
  const dataLayerOnMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      if (e.evt.buttons === 1) {
        dispatchInputDrawingPointFromMouseEvent(e);
      }
    },
    [dispatchInputDrawingPointFromMouseEvent]
  );

  // stop drawing input path on mouse up and update qArray
  const dataLayerOnMouseUp = useCallback(
    (_e: Konva.KonvaEventObject<MouseEvent>): void => {
      setIsDrawing(false);
      dispatch(updateActiveSheetQArray()); // make sure to trigger recalculation of qArray
    },
    [dispatch]
  );

  return (
    <>
      <InteractiveStage
        title="Inputs"
        stageId={inputStageId}
        dataLayerOnMouseMove={dataLayerOnMouseMove}
        dataLayerOnMouseDown={dataLayerOnMouseDown}
        dataLayerOnMouseUp={dataLayerOnMouseUp}
        topControls={<InputTopControls />}
        bottomControls={<InputBottomControls />}
      >
        <>
          {/* render input drawing points */}
          <InputDrawingPointsLine
            stroke={inputLineColor}
            strokeWidth={inputStrokeWidth}
            isDrawing={isDrawing}
          />
          {/* render line used to generate values */}
          {!isDrawing && (
            <QArrayLine
              stroke={inputLineColor}
              strokeWidth={inputStrokeWidth}
            />
          )}
          {/* render last sheet end point if available */}
          <PreviousSheetQn />
          {/* keep bad points on top */}
          <BadPoints />
        </>
      </InteractiveStage>
    </>
  );
}

export default InputArea;
