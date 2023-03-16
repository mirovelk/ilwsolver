import { Line } from 'react-konva';

import { selectBadPoints } from '../../../../redux/features/badPoints/badPointsSlice';

import { useAppSelector } from '../../../../redux/store';

function BadPoints() {
  const badPoints = useAppSelector(selectBadPoints);

  return (
    <>
      {badPoints.map((point, pointIndex) => (
        <Line
          key={pointIndex}
          points={point}
          stroke="#ffff00"
          strokeWidth={4}
          strokeScaleEnabled={false}
          lineCap="round"
          closed
        />
      ))}
    </>
  );
}

export default BadPoints;
