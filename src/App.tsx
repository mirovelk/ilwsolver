import styled from '@emotion/styled';
import React from 'react';

import InputArea from './components/InputArea';
import StyleProvider from './support/style/StyleProvider';

const Wrapper = styled.div`
  height: 100%;
  padding: 20px;
`;

function App() {
  return (
    <StyleProvider>
      <Wrapper>
        <InputArea />
      </Wrapper>
    </StyleProvider>
  );
}

export default App;
