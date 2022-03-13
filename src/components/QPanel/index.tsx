/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ContentCopy } from '@mui/icons-material';
import { IconButton, Paper as MaterialPaper, Typography } from '@mui/material';
import clipboard from 'clipboardy';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useAppStateInputValues from '../../support/AppStateProvider/useAppStateInputValues';
import { stringifyForMathematica } from '../../util/mathematica';

const Panel = styled(MaterialPaper)`
  display: inline-flex;
  flex-direction: column;
  position: absolute;
  z-index: 2000;
  top: 135px;
  left: 30px;
  padding: 10px 20px;
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  height: 40px;
`;

const Content = styled.div``;

const Row = styled.div`
  display: flex;
  align-items: center;
  height: 45px;
`;

const iconSpacing = "10px";

function QPanel() {
  const { appStateInputValues } = useAppStateInputValues();

  const copyInput = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      clipboard.write(stringifyForMathematica(appStateInputValues));
    },
    [appStateInputValues]
  );

  const copyQ0 = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      clipboard.write(stringifyForMathematica(appStateInputValues[0]));
    },
    [appStateInputValues]
  );

  const copyQN = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      clipboard.write(
        stringifyForMathematica(
          appStateInputValues[appStateInputValues.length - 1]
        )
      );
    },
    [appStateInputValues]
  );

  return (
    <Panel elevation={3}>
      <Header>
        <IconButton
          onClick={copyInput}
          css={css`
            margin-right: ${iconSpacing};
          `}
          disabled={!(appStateInputValues.length > 0)}
        >
          <ContentCopy />
        </IconButton>
        <Typography variant="h6" color="text.secondary">
          q
        </Typography>
      </Header>

      <Content>
        <Row>
          <IconButton
            onClick={copyQ0}
            css={css`
              margin-right: ${iconSpacing};
            `}
            disabled={!(appStateInputValues.length > 0)}
          >
            <ContentCopy />
          </IconButton>
          <Typography variant="subtitle1" color="text.secondary">
            q<sub>0</sub>
            {" = "}
            {appStateInputValues.length > 0 ? (
              <>
                {" { "}
                {appStateInputValues[0][0]}, {appStateInputValues[0][1]}
                {" } "}
              </>
            ) : (
              "undefined"
            )}
          </Typography>
        </Row>
        <Row>
          <IconButton
            onClick={copyQN}
            css={css`
              margin-right: ${iconSpacing};
            `}
            disabled={!(appStateInputValues.length > 0)}
          >
            <ContentCopy />
          </IconButton>
          <Typography variant="subtitle1" color="text.secondary">
            q<sub>n</sub>
            {" = "}
            {appStateInputValues.length > 0 ? (
              <>
                {" { "}
                {appStateInputValues[appStateInputValues.length - 1][0]},{" "}
                {appStateInputValues[appStateInputValues.length - 1][1]}
                {" } "}
              </>
            ) : (
              "undefined"
            )}
          </Typography>
        </Row>
      </Content>
    </Panel>
  );
}

export default React.memo(QPanel);
