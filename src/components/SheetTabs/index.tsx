import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Add, Close } from '@mui/icons-material';
import { IconButton, Tab, Tabs } from '@mui/material';
import React, { useCallback } from 'react';

import {
  addSheet,
  removeSheetWithId,
  selectActiveSheetId,
  selectSheetIds,
  setActiveSheetId,
} from '../../redux/features/app/appSlice';
import { SheetId } from '../../redux/features/app/types';
import { useAppDispatch, useAppSelector } from '../../redux/store';

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
  const activeSheetId = useAppSelector(selectActiveSheetId);
  const sheetIds = useAppSelector(selectSheetIds);

  const addSheetOnClick = useCallback(() => {
    dispatch(addSheet());
  }, [dispatch]);

  const setActiveSheetOnClick = useCallback(
    (_e: React.SyntheticEvent<Element, Event>, value: SheetId) => {
      dispatch(setActiveSheetId(value));
    },
    [dispatch]
  );

  const removeSheetOnClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>, sheetIndex: SheetId) => {
      e.stopPropagation();
      if (window.confirm('Remove tab?')) {
        dispatch(removeSheetWithId(sheetIndex));
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
      <StyledTabs value={activeSheetId} onChange={setActiveSheetOnClick}>
        {sheetIds.map((sheetId) => (
          <StyledTab
            label={
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  margin-left: 5px;
                `}
              >
                {sheetId}
                {sheetIds.length > 1 && (
                  <Close
                    fontSize="inherit"
                    onClick={(e) => removeSheetOnClick(e, sheetId)}
                    css={css`
                      margin-left: 5px;
                    `}
                  />
                )}
              </div>
            }
            value={sheetId}
            key={sheetId}
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
