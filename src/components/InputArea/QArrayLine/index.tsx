import { useMemo } from 'react';

import { selectActiveSheetQArray } from '../../../redux/features/sheets/sheetsSlice';

import { useAppSelector } from '../../../redux/store';
import LineWithIcons from '../../LineWithIcons';

function QArrayLine({
  stroke,
  strokeWidth,
}: {
  stroke: string;
  strokeWidth: number;
}) {
  const qArray = useAppSelector(selectActiveSheetQArray);

  const qArrayLinePoints = useMemo(
    () => qArray.flatMap((point) => point),
    [qArray]
  );

  return (
    <LineWithIcons
      points={qArrayLinePoints}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeScaleEnabled={false}
      lineCap="round"
      lineJoin="round"
    />
  );
}

export default QArrayLine;
