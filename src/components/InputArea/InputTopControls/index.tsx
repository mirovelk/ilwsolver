import { Panel } from '../../../redux/features/uiPanels/uiPanelsSlice';
import PopupPanel from '../../PopupPanel';
import SheetTabs from '../../SheetTabs';
import BadPointEditor from '../../BadPointEditor';
import SolverConfigEditor from '../../SolverConfigEditor';
import { GpsFixed, Settings } from '@mui/icons-material';

function InputTopControls() {
  return (
    <div className="flex w-full justify-between relative">
      <div>
        <SheetTabs />
      </div>
      <div className="flex">
        <PopupPanel
          panel={Panel.BadPointsPanel}
          icon={<GpsFixed />}
          placement="right"
        >
          <BadPointEditor />
        </PopupPanel>
        <PopupPanel
          panel={Panel.SolverConfigPanel}
          icon={<Settings />}
          placement="right"
        >
          <SolverConfigEditor />
        </PopupPanel>
      </div>
    </div>
  );
}

export default InputTopControls;
