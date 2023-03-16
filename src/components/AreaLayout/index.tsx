import { css } from '@emotion/react';
import styled from '@emotion/styled';

import React from 'react';

const Title = styled.h2`
  margin: 0 20px 5px 0;
`;

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

function AreaLayout({
  title,
  topControls,
  bottomControls,
  children,
}: {
  title: string;
  topControls: JSX.Element;
  bottomControls: JSX.Element;
  children?: React.ReactNode;
}) {
  return (
    <Wrapper>
      <div>
        <div
          css={css`
            height: 40px;
            margin-bottom: 5px;
            display: flex;
          `}
        >
          <Title>{title}</Title>
          {topControls}
        </div>
        <div
          css={css`
            height: 35px;
            margin-bottom: 15px;
            margin-right: 40px;
            display: flex;
          `}
        >
          {bottomControls}
        </div>
      </div>

      {children}
    </Wrapper>
  );
}

export default AreaLayout;
