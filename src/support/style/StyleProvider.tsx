import { css, Global } from "@emotion/react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";

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
          body,
          #root {
            height: 100%;
            user-select: none; /* supported by Chrome and Opera */
            -webkit-user-select: none; /* Safari */
            -khtml-user-select: none; /* Konqueror HTML */
            -moz-user-select: none; /* Firefox */
            -ms-user-select: none; /* Internet Explorer/Edge */
          }
        `}
      />
      {children}
    </ThemeProvider>
  );
}

export default StyleProvider;
