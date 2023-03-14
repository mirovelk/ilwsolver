import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../store';
import { XSeedId } from '../xSeeds/xSeedsSlice';

// TODO make this into xSeedColor feature?
export const xSeedColorPickerSlice = createSlice({
  name: 'xSeedColorPicker',
  initialState: {
    visibleColorPickerXSeedId: null as XSeedId | null,
  },
  reducers: {
    toggleColorPickerForXSeedId: (
      state,
      action: PayloadAction<{ xSeedId: XSeedId }>
    ) => {
      state.visibleColorPickerXSeedId =
        state.visibleColorPickerXSeedId !== action.payload.xSeedId
          ? action.payload.xSeedId
          : null;
    },
  },
});

// Selectors
export const selectVisibleColorPickerXSeedId = (state: RootState) =>
  state.xSeedColorPicker.visibleColorPickerXSeedId;

const { actions, reducer } = xSeedColorPickerSlice;

export const { toggleColorPickerForXSeedId } = actions;

export default reducer;
