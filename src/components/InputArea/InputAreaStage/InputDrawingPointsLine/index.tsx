import { useMemo } from 'react';
import { Line } from 'react-konva';

import { selectActiveSheetInputDrawingPoints } from '../../../../redux/selectors/selectActiveSheetInputDrawingPoints';

import { useAppSelector } from '../../../../redux/store';
import { selectIsDrawing } from '../../../../redux/features/sheetInputDrawing/sheetInputDrawingSlice';

function InputDrawingPointsLine({
  stroke,
  strokeWidth,
}: {
  stroke: string;
  strokeWidth: number;
}) {
  const isDrawing = useAppSelector(selectIsDrawing);

  const inputDrawingPoints = useAppSelector(
    selectActiveSheetInputDrawingPoints
  );

  const inputDrawingPointsLinePoints = useMemo(
    () => inputDrawingPoints.flatMap((point) => point),
    [inputDrawingPoints]
  );

  return (
    <Line
      points={inputDrawingPointsLinePoints}
      stroke={isDrawing ? stroke : '#777777'}
      strokeWidth={isDrawing ? strokeWidth : 1}
      strokeScaleEnabled={false}
      lineCap="round"
      lineJoin="round"
    />
  );
}

export default InputDrawingPointsLine;
