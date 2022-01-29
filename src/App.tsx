import styled from "@emotion/styled";
import React, { useRef } from "react";
import Paper from "paper";

import StyleProvider from "./support/style/StyleProvider";
import InputArea from "./components/InputArea";
import OutputArea from "./components/OutputArea";

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 20px;
  align-items: stretch;
`;

const AreaWrapper = styled.div`
  flex: 1 0 0;
  &:not(:last-child) {
    margin-right: 20px;
  }
`;

function App() {
  const inputPaperRef = useRef(new Paper.PaperScope());
  const outputPaperRef = useRef(new Paper.PaperScope());

  const inputPathRef = useRef<paper.Path>();

  return (
    <StyleProvider>
      <Wrapper>
        <AreaWrapper>
          <InputArea
            paper={inputPaperRef.current}
            inputPathRef={inputPathRef}
          />
        </AreaWrapper>
        <AreaWrapper>
          <OutputArea paper={outputPaperRef.current} />
        </AreaWrapper>
      </Wrapper>
    </StyleProvider>
  );
}

export default App;
