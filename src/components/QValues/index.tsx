import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ContentCopy } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
import clipboard from 'clipboardy';
import React, { useCallback, useMemo } from 'react';
import { selectActiveSheetQArray } from 'redux/features/sheets/sheetsSlice';

import { useAppSelector } from 'redux/store';
import { stringifyComplex } from 'util/complex';
import { stringifyComplexArrayForMathematica } from 'util/mathematica';

const Wrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
  white-space: nowrap;
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

const iconSpacing = '10px';

function QValues() {
  const qArray = useAppSelector(selectActiveSheetQArray);

  const copyInput = useCallback(
    (_e: React.MouseEvent<HTMLButtonElement>) => {
      clipboard.write(stringifyComplexArrayForMathematica(qArray));
    },
    [qArray]
  );

  const q0 = useMemo(() => {
    if (qArray.length > 0) {
      return stringifyComplex(qArray[0], true);
    }
    return 'undefined';
  }, [qArray]);

  const qN = useMemo(() => {
    if (qArray.length > 0) {
      return stringifyComplex(qArray[qArray.length - 1], true);
    }
    return 'undefined';
  }, [qArray]);

  const copyQ0 = useCallback(
    (_e: React.MouseEvent<HTMLButtonElement>) => {
      clipboard.write(q0);
    },
    [q0]
  );

  const copyQN = useCallback(
    (_e: React.MouseEvent<HTMLButtonElement>) => {
      clipboard.write(qN);
    },
    [qN]
  );

  return (
    <Wrapper>
      <Header>
        <IconButton
          onClick={copyInput}
          css={css`
            margin-right: ${iconSpacing};
          `}
          disabled={!(qArray.length > 0)}
        >
          <ContentCopy />
        </IconButton>
        <Typography variant="h6" color="text.secondary">
          q<sub>[0,n]</sub>
        </Typography>
      </Header>

      <Content>
        <Row>
          <IconButton
            onClick={copyQ0}
            css={css`
              margin-right: ${iconSpacing};
            `}
            disabled={!(qArray.length > 0)}
          >
            <ContentCopy />
          </IconButton>
          <Typography variant="subtitle1" color="text.secondary">
            q<sub>0</sub>
            {' = '}
            {qArray.length > 0 ? q0 : 'undefined'}
          </Typography>
        </Row>
        <Row>
          <IconButton
            onClick={copyQN}
            css={css`
              margin-right: ${iconSpacing};
            `}
            disabled={!(qArray.length > 0)}
          >
            <ContentCopy />
          </IconButton>
          <Typography variant="subtitle1" color="text.secondary">
            q<sub>n</sub>
            {' = '}
            {qArray.length > 0 ? qN : 'undefined'}
          </Typography>
        </Row>
      </Content>
    </Wrapper>
  );
}

export default QValues;
