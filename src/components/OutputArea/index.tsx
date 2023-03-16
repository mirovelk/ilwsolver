import { ResultsInQArray } from '../../core/solve';

import { StageId } from '../../redux/features/stages/stagesSlice';

import AreaLayout from '../AreaLayout';
import OutputAreaStage from './OutputAreaStage';
import OutputAreaTopControls from './OutputAreaTopControls';

export interface Output {
  result: ResultsInQArray;
  valid: boolean;
}

function OutputArea({ outputStageId }: { outputStageId: StageId }) {
  return (
    <AreaLayout
      title="Outputs"
      topControls={<OutputAreaTopControls />}
      bottomControls={<></>}
    >
      <OutputAreaStage outputStageId={outputStageId} />
    </AreaLayout>
  );
}

export default OutputArea;
