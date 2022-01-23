import React from "react";

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { css, Global } from "@emotion/react";

interface Props {
  children: JSX.Element;
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function StyleProvider({ children }: Props) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Global
        styles={css`
          html,
          body {
            height: 100%;
          }
          #root {
            height: 100%;
          }
        `}
      />
      {children}
    </ThemeProvider>
  );
}

export default StyleProvider;
