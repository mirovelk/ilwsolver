import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Complex } from '../../../util/complex';
import { RootState } from '../../store';
import { BadPointsState } from './types';

const initialState: BadPointsState = {
  points: [
    [-58.0141, 0],
    [-55.6141, 0],
    [-2.87771, 0],
    [-1.13319, 0],
    [-1, 0],
    [-0.882464, 0],
    [-0.347498, 0],
    [-0.21514, -9.43404],
    [-0.21514, 9.43404],
    [-0.139849, -0.990173],
    [-0.139849, 0.990173],
    [-0.017981, 0],
    [-0.0172372, 0],
    [-0.00241602, -0.105944],
    [-0.00241602, 0.105944],
    [0, 0],
    [0.021071, 0],
    [0.168469, -0.432772],
    [0.168469, 0.432772],
    [0.306398, -0.528142],
    [0.306398, 0.528142],
    [0.781129, -2.00661],
    [0.781129, 2.00661],
    [0.821853, -1.41664],
    [0.821853, 1.41664],
    [1, 0],
    [47.4586, 0],
  ],
};

export const badPointsSlice = createSlice({
  name: 'badPoints',
  initialState,
  reducers: {
    setBadPoints: (state, action: PayloadAction<Complex[]>) => {
      state.points = action.payload;
    },
  },
});

// Selectors
export const selectBadPoints = (state: RootState) => state.badPoints.points;

const { actions, reducer } = badPointsSlice;

export const { setBadPoints } = actions;

export default reducer;
