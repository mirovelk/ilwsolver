import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Add, Close } from '@mui/icons-material';
import { IconButton, Tab, Tabs } from '@mui/material';
import React, { useCallback } from 'react';

import {
  addSheet,
  removeSheetWithIndex,
  selectActiveSheetIndex,
  selectSheets,
  setActiveSheetIndex,
} from '../../redux/features/app/appSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';

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
  const dispatch = useAppDispatch();
  const activeSheetIndex = useAppSelector(selectActiveSheetIndex); // TODO do differently not to rely on indexes
  const sheets = useAppSelector(selectSheets); // TODO triggers re-renders

  const addSheetOnClick = useCallback(() => {
    dispatch(addSheet());
  }, [dispatch]);

  const setActiveSheetOnClick = useCallback(
    (_e, value) => {
      dispatch(setActiveSheetIndex(value));
    },
    [dispatch]
  );

  const removeSheetOnClick = useCallback(
    (e, sheetIndex) => {
      e.stopPropagation();
      if (window.confirm("Remove tab?")) {
        dispatch(removeSheetWithIndex(sheetIndex));
      } else {
        // Do nothing!
      }
    },
    [dispatch]
  );

  return (
    <div
      css={css`
        display: flex;
      `}
    >
      <StyledTabs value={activeSheetIndex} onChange={setActiveSheetOnClick}>
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
                    onClick={(e) => removeSheetOnClick(e, sheetIndex)}
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
        <IconButton onClick={addSheetOnClick}>
          <Add />
        </IconButton>
      </span>
    </div>
  );
}

export default React.memo(SheetTabs);
