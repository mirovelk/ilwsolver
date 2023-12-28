import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { RootState } from '../../store';
import { removeSheet, SheetId } from '../sheets/sheetsSlice';
import { clearInputOutputValues } from '../../actions';

type DrawingPoint = [number, number];

interface SheetInputDrawingPoints {
  sheetId: SheetId;
  points: Array<DrawingPoint>;
}

const sheetInputDrawingPointsAdapter =
  createEntityAdapter<SheetInputDrawingPoints>({
    selectId: (sheetInputDrawingPoints) => sheetInputDrawingPoints.sheetId,
  });

export const sheetInputDrawingSlice = createSlice({
  name: 'sheetInputDrawing',
  initialState: sheetInputDrawingPointsAdapter.getInitialState({
    isDrawing: false,
  }),
  reducers: {
    startDrawing: (state) => {
      console.log('startDrawing :>> ');
      state.isDrawing = true;
    },
    stopDrawing: (state) => {
      state.isDrawing = false;
    },
    addInputDrawingPoint: (
      state,
      action: PayloadAction<{ sheetId: SheetId; point: DrawingPoint }>
    ) => {
      const { sheetId, point } = action.payload;
      const prevPoints: DrawingPoint[] = state.entities[sheetId]?.points ?? [];
      sheetInputDrawingPointsAdapter.upsertOne(state, {
        sheetId,
        points: [...prevPoints, point],
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(removeSheet, (state, action) => {
      const { sheetId } = action.payload;
      sheetInputDrawingPointsAdapter.removeOne(state, sheetId);
    });
    builder.addCase(clearInputOutputValues, (state, action) => {
      const { sheetId } = action.payload;
      sheetInputDrawingPointsAdapter.removeOne(state, sheetId);
    });
  },
});

// Selectors
export const { selectEntities: selectSheetDrawingPointsBySheetIdEntries } =
  sheetInputDrawingPointsAdapter.getSelectors(
    (state: RootState) => state.sheetInputDrawing
  );

export const selectIsDrawing = (state: RootState) =>
  state.sheetInputDrawing.isDrawing;

const { actions, reducer } = sheetInputDrawingSlice;

export const { startDrawing, stopDrawing, addInputDrawingPoint } = actions;

export default reducer;
