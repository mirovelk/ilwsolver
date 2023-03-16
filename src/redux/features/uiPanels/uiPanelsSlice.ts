import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../store';

export function getPanelToggleColor(isActivePanel: boolean) {
  return isActivePanel ? 'primary' : 'default';
}

export enum Panel {
  XSeedsPanel,
  QPanel,
  BadPointsPanel,
  SolverConfigPanel,
}

const initialState = {
  activePanel: null as Panel | null,
};

export const uiPanelsSlice = createSlice({
  name: 'uiPanels',
  initialState,
  reducers: {
    toggleActivePanel(
      state,
      action: PayloadAction<{
        panel: Panel;
      }>
    ) {
      const { panel } = action.payload;
      state.activePanel = state.activePanel !== panel ? panel : null;
    },
  },
});

// Selectors
export const selectIsActivePanel = (state: RootState, panel: Panel) =>
  state.uiPanels.activePanel === panel;

const { actions, reducer } = uiPanelsSlice;

export const { toggleActivePanel } = actions;

export default reducer;
