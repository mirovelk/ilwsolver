import AreaLayout from '../AreaLayout';
import OutputAreaStage from './OutputAreaStage';
import OutputAreaTopControls from './OutputAreaTopControls';

function OutputArea() {
  return (
    <AreaLayout
      title="Outputs"
      topControls={<OutputAreaTopControls />}
      bottomControls={<></>}
    >
      <OutputAreaStage />
    </AreaLayout>
  );
}

export default OutputArea;
