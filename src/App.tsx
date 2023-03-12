import styled from '@emotion/styled';

import InputArea from './components/InputArea';
import OutputArea from './components/OutputArea';
import StyleProvider from './components/StyleProvider';
import CenterControls from './components/CenterControls';
import { useAppSelector } from './redux/store';
import { selectActiveSheetStageIds } from './redux/features/sheets/sheetsSlice';

const Wrapper = styled.div`
  position: relative;
  height: 100%;
`;

const AreasWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 20px;
  align-items: stretch;
`;

const Area = styled.div`
  flex: 1 0 0;
  min-width: 0;

  &:not(:last-child) {
    margin-right: 20px;
  }
`;

function App() {
  const activeSheetStageIds = useAppSelector(selectActiveSheetStageIds);

  return (
    <StyleProvider>
      <Wrapper>
        <CenterControls />
        <AreasWrapper>
          <Area>
            <InputArea inputStageId={activeSheetStageIds.inputStageId} />
          </Area>
          <Area>
            <OutputArea outputStageId={activeSheetStageIds.outputStageId} />
          </Area>
        </AreasWrapper>
      </Wrapper>
    </StyleProvider>
  );
}

export default App;
