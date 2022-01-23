import React from "react";

import styled from "@emotion/styled";
import { Button } from "@mui/material";

import StyleProvider from "./support/StyleProvider";
import InputCanvas from "./components/InputCanvas";

const Wrapper = styled.div`
  height: 100%;
  padding: 20px;
`;

function App() {
  return (
    <StyleProvider>
      <Wrapper>
        <InputCanvas />
      </Wrapper>
    </StyleProvider>
  );
}

export default App;
