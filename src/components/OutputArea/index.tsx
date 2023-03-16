import { css } from '@emotion/react';
import { Button, ButtonGroup } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../redux/store';
import { ResultsInQArray } from '../../core/solve';

import { StageId } from '../../redux/features/stages/stagesSlice';
import {
  OutputProjectionVariant,
  selectOutputProjectionVariant,
} from '../../redux/features/results/resultsSlice';

import { setProjectionVariantAndCenterActiveSheetResults } from '../../redux/thunks/setProjectionVariantAndCenterActiveSheetResults';
import AreaLayout from '../AreaLayout';
import OutputAreaStage from './OutputAreaStage';

export interface Output {
  result: ResultsInQArray;
  valid: boolean;
}

function OutputArea({ outputStageId }: { outputStageId: StageId }) {
  const dispatch = useAppDispatch();

  const outputProjectionVariant = useAppSelector(selectOutputProjectionVariant);

  return (
    <AreaLayout
      title="Outputs"
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
    >
      <OutputAreaStage outputStageId={outputStageId} />
    </AreaLayout>
  );
}

export default OutputArea;
