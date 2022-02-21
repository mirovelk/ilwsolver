/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Add } from '@mui/icons-material';
import { IconButton, Tab, Tabs } from '@mui/material';
import React, { useCallback } from 'react';

import { addSheetAction, setActiveSheetAction } from '../../support/AppStateProvider/reducer';
import useAppDispatch from '../../support/AppStateProvider/useAppDispatch';
import useAppStateSheets from '../../support/AppStateProvider/useAppStateSheets';

const StyledTabs = styled(Tabs)`
  min-height: 35px;
`;

const StyledTab = styled(Tab)`
  min-width: 0;
  min-height: 35px;
  padding: 5px 16px;
`;

function SheetTabs() {
  const { appDispatch } = useAppDispatch();
  const { sheets, activeSheetIndex } = useAppStateSheets();

  const addSheet = useCallback(() => {
    appDispatch(addSheetAction());
  }, [appDispatch]);

  const setActiveSheet = useCallback(
    (_e, value) => {
      appDispatch(setActiveSheetAction(value));
    },
    [appDispatch]
  );

  return (
    <div
      css={css`
        display: flex;
      `}
    >
      <StyledTabs
        value={activeSheetIndex}
        onChange={setActiveSheet}
        variant="scrollable"
      >
        {sheets.map((sheet, sheetIndex) => (
          <StyledTab
            label={sheetIndex + 1}
            value={sheetIndex}
            key={sheetIndex}
          />
        ))}
      </StyledTabs>
      <span>
        <IconButton onClick={addSheet}>
          <Add />
        </IconButton>
      </span>
    </div>
  );
}

export default React.memo(SheetTabs);
