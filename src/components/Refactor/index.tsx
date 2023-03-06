import { css } from '@emotion/react';
import XSeedValue from '../XSeedValue';

function Refactor() {
  return (
    <div
      css={css`
        margin: 20px;
      `}
    >
      <XSeedValue xSeedId="test" />
      <XSeedValue xSeedId="test2" />
      <XSeedValue xSeedId="test3" />
      <XSeedValue xSeedId="test" />
    </div>
  );
}

export default Refactor;
