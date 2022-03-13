import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Add, Close } from '@mui/icons-material';
import { IconButton, Tab, Tabs } from '@mui/material';
import React, { useCallback } from 'react';

import { addSheetAction, removeSheetAction, setActiveSheetAction } from '../../support/AppStateProvider/reducer';
import useAppDispatch from '../../support/AppStateProvider/useAppDispatch';
import useAppStateSheets from '../../support/AppStateProvider/useAppStateSheets';

/** @jsxImportSource @emotion/react */
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

  const removeSheet = useCallback(
    (e, sheetIndex) => {
      e.stopPropagation();
      if (window.confirm("Remove tab?")) {
        appDispatch(removeSheetAction(sheetIndex));
      } else {
        // Do nothing!
      }
    },
    [appDispatch]
  );

  return (
    <div
      css={css`
        display: flex;
      `}
    >
      <StyledTabs value={activeSheetIndex} onChange={setActiveSheet}>
        {sheets.map((sheet, sheetIndex) => (
          <StyledTab
            label={
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  margin-left: 5px;
                `}
              >
                {sheet.label}
                {sheets.length > 1 && (
                  <Close
                    fontSize="inherit"
                    onClick={(e) => removeSheet(e, sheetIndex)}
                    css={css`
                      margin-left: 5px;
                    `}
                  />
                )}
              </div>
            }
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
