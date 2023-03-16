import { css } from '@emotion/react';
import { IconButton, Paper, styled } from '@mui/material';
import { useCallback } from 'react';
import {
  getPanelToggleColor,
  Panel,
  selectIsActivePanel,
  toggleActivePanel,
} from '../../redux/features/uiPanels/uiPanelsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';

const PaperPanel = styled(Paper)`
  padding: 10px 20px;
  min-width: 400px;
`;

function PopupPanel({
  panel,
  icon,
  children,
  placement,
}: {
  panel: Panel;
  icon: React.ReactNode;
  children: React.ReactNode;
  placement: 'left' | 'right';
}) {
  const isActivePanel = useAppSelector((state) =>
    selectIsActivePanel(state, panel)
  );
  const dispatch = useAppDispatch();

  const togglePanel = useCallback(() => {
    dispatch(toggleActivePanel({ panel }));
  }, [dispatch, panel]);

  return (
    <div
      css={css`
        position: relative;
      `}
    >
      <IconButton
        onClick={togglePanel}
        color={getPanelToggleColor(isActivePanel)}
        css={css`
          font-size: 22px;
          width: 40px;
          height: 40px;
        `}
      >
        {icon}
      </IconButton>
      {isActivePanel && (
        <div
          css={css`
            position: absolute;
            z-index: 2000;
            top: 45px;
            right: ${placement === 'right' ? 0 : undefined};
            left: ${placement === 'left' ? 0 : undefined};
          `}
        >
          <PaperPanel elevation={3}>{children}</PaperPanel>
        </div>
      )}
    </div>
  );
}

export default PopupPanel;
