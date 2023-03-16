import styled from '@emotion/styled';

import InputArea from './components/InputArea';
import OutputArea from './components/OutputArea';
import StyleProvider from './components/StyleProvider';
import CenterControls from './components/CenterControls';

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
  return (
    <StyleProvider>
      <Wrapper>
        <CenterControls />
        <AreasWrapper>
          <Area>
            <InputArea />
          </Area>
          <Area>
            <OutputArea />
          </Area>
        </AreasWrapper>
      </Wrapper>
    </StyleProvider>
  );
}

export default App;
