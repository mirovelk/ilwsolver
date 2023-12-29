import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { required } from 'util/required';

import { RootState } from 'redux/store';
import { addSheet, removeSheet } from 'redux/features/sheets/sheetsSlice';
import {
  addXSeed,
  initialXSeeds,
  removeXSeed,
  XSeedId,
} from 'redux/features/xSeeds/xSeedsSlice';

interface XSeedColor {
  xSeedId: XSeedId;
  color: string;
}

export const initialXSeedColors: XSeedColor[] = [
  {
    xSeedId: initialXSeeds[0].id,
    color: 'rgb(0, 127, 255)',
  },
  {
    xSeedId: initialXSeeds[1].id,
    color: 'rgb(255, 127, 0)',
  },
];

if (initialXSeeds.length !== initialXSeedColors.length) {
  throw new Error(
    'initialXSeeds and initialXSeedColors must have the same length'
  );
}

const xSeedColorsAdapter = createEntityAdapter<XSeedColor>({
  selectId: (xSeedColor) => xSeedColor.xSeedId,
});

const emptyInitialState = xSeedColorsAdapter.getInitialState({
  visibleColorPickerXSeedId: null as XSeedId | null,
});
const filledInitialState = xSeedColorsAdapter.upsertMany(
  emptyInitialState,
  initialXSeedColors
);

export const xSeedColorSlice = createSlice({
  name: 'xSeedColors',
  initialState: filledInitialState,
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
    addXSeedColor: (
      state,
      action: PayloadAction<{ xSeedId: XSeedId; color: string }>
    ) => {
      const { xSeedId, color } = action.payload;
      xSeedColorsAdapter.addOne(state, {
        xSeedId,
        color,
      });
    },
    removeXSeedColor: (state, action: PayloadAction<{ xSeedId: XSeedId }>) => {
      xSeedColorsAdapter.removeOne(state, action.payload.xSeedId);
    },
    setXSeedColor: (
      state,
      action: PayloadAction<{
        xSeedId: XSeedId;
        color: string;
      }>
    ) => {
      const { xSeedId, color } = action.payload;
      xSeedColorsAdapter.updateOne(state, {
        id: xSeedId,
        changes: { color },
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addXSeed, (state, action) => {
      const { xSeedId, color } = action.payload;
      xSeedColorSlice.caseReducers.addXSeedColor(
        state,
        xSeedColorSlice.actions.addXSeedColor({ xSeedId, color })
      );
    });
    builder.addCase(removeXSeed, (state, action) => {
      const { xSeedId } = action.payload;
      xSeedColorSlice.caseReducers.removeXSeedColor(
        state,
        xSeedColorSlice.actions.removeXSeedColor({ xSeedId })
      );
    });
    builder.addCase(addSheet, (state, action) => {
      const { xSeeds } = action.payload;
      xSeeds.forEach((xSeed) => {
        xSeedColorSlice.caseReducers.addXSeedColor(
          state,
          xSeedColorSlice.actions.addXSeedColor({
            xSeedId: xSeed.xSeedId,
            color: xSeed.color,
          })
        );
      });
    });
    builder.addCase(removeSheet, (state, action) => {
      const { xSeedIds } = action.payload;
      xSeedIds.forEach((xSeedId) => {
        xSeedColorSlice.caseReducers.removeXSeedColor(
          state,
          xSeedColorSlice.actions.removeXSeedColor({ xSeedId })
        );
      });
    });
  },
});

// Selectors
export const { selectById: selectXSeedColorById } =
  xSeedColorsAdapter.getSelectors((state: RootState) => state.xSeedColors);

export const selectVisibleColorPickerXSeedId = (state: RootState) =>
  state.xSeedColors.visibleColorPickerXSeedId;

export const selectXSeedColor = (state: RootState, xSeedId: XSeedId) =>
  required(selectXSeedColorById(state, xSeedId)).color;

export const selectXSeedsColors = (state: RootState, xSeedIds: XSeedId[]) =>
  xSeedIds.map(
    (xSeedId) => required(selectXSeedColorById(state, xSeedId)).color
  );

const { actions, reducer } = xSeedColorSlice;

export const { toggleColorPickerForXSeedId, setXSeedColor } = actions;

export default reducer;
