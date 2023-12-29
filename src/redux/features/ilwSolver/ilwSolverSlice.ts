import { createSlice } from '@reduxjs/toolkit';

import { RootState } from 'redux/store';
import { solveActiveSheet } from './solveActiveSheet';

const initialState = {
  solvingInProgress: false,
};

export const ilwSolverSlice = createSlice({
  name: 'ilwSolver',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(solveActiveSheet.pending, (state) => {
      state.solvingInProgress = true;
    });
    builder.addCase(solveActiveSheet.rejected, (state) => {
      state.solvingInProgress = false;
    });
    builder.addCase(solveActiveSheet.fulfilled, (state) => {
      state.solvingInProgress = false;
    });
  },
});

// Selectors
export const selectSolvingInprogress = (state: RootState) =>
  state.ilwSolver.solvingInProgress;

const { reducer } = ilwSolverSlice;

export default reducer;
