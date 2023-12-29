import { Line } from 'react-konva';

import { selectPreviousSheetQn } from 'redux/features/sheets/sheetsSlice';

import { useAppSelector } from 'redux/store';

function PreviousSheetQn() {
  const previousSheetQn = useAppSelector(selectPreviousSheetQn);

  return (
    <>
      {previousSheetQn && (
        <Line
          points={previousSheetQn}
          stroke="#00ffff"
          strokeWidth={5}
          strokeScaleEnabled={false}
          lineCap="square"
          closed
        />
      )}
    </>
  );
}

export default PreviousSheetQn;
