import { StageId } from '../../redux/features/stages/stagesSlice';

import InputTopControls from './InputTopControls';
import InputBottomControls from './InputBottomControls';
import AreaLayout from '../AreaLayout';
import InputAreaStage from './InputAreaStage';

function InputArea({ inputStageId }: { inputStageId: StageId }) {
  return (
    <AreaLayout
      title="Inputs"
      topControls={<InputTopControls />}
      bottomControls={<InputBottomControls />}
    >
      <InputAreaStage inputStageId={inputStageId} />
    </AreaLayout>
  );
}

export default InputArea;
