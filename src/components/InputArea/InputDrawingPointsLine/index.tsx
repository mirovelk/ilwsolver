import { useMemo } from 'react';
import { Line } from 'react-konva';

import { selectActiveSheetInputDrawingPoints } from '../../../redux/features/sheets/sheetsSlice';

import { useAppSelector } from '../../../redux/store';

function InputDrawingPointsLine({
  stroke,
  strokeWidth,
  isDrawing,
}: {
  stroke: string;
  strokeWidth: number;
  isDrawing: boolean; // TODO store state?
}) {
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
