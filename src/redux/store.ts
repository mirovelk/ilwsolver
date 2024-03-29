import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import sheetsSliceReducer from './features/sheets/sheetsSlice';
import xSeedsSliceReducer from './features/xSeeds/xSeedsSlice';
import stagesSliceReducer from './features/stages/stagesSlice';
import resultsSliceReducer from './features/results/resultsSlice';
import solverConfigSliceReducer from './features/solverConfig/solverConfigSlice';
import ilwSolverSliceReducer from './features/ilwSolver/ilwSolverSlice';
import badPointsSliceReducer from './features/badPoints/badPointsSlice';
import xSeedColorsSliceReducer from './features/xSeedColors/xSeedColorsSlice';
import uiPanelsSliceReducer from './features/uiPanels/uiPanelsSlice';
import sheetInputDrawingSliceReducer from './features/sheetInputDrawing/sheetInputDrawingSlice';

const store = configureStore({
  reducer: {
    sheets: sheetsSliceReducer,
    xSeeds: xSeedsSliceReducer,
    xSeedColors: xSeedColorsSliceReducer,
    stages: stagesSliceReducer,
    results: resultsSliceReducer,
    solverConfig: solverConfigSliceReducer,
    ilwSolver: ilwSolverSliceReducer,
    badPoints: badPointsSliceReducer,
    uiPanels: uiPanelsSliceReducer,
    sheetInputDrawing: sheetInputDrawingSliceReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
