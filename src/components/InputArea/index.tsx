import InputTopControls from './InputTopControls';
import InputBottomControls from './InputBottomControls';
import AreaLayout from '../AreaLayout';
import InputAreaStage from './InputAreaStage';

function InputArea() {
  return (
    <AreaLayout
      title="Inputs"
      topControls={<InputTopControls />}
      bottomControls={<InputBottomControls />}
    >
      <InputAreaStage />
    </AreaLayout>
  );
}

export default InputArea;
