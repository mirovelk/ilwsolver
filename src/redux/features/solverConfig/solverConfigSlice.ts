import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ax, Ex } from '../../../core/solve';

import { complex, Complex } from '../../../util/complex';
import { RootState } from '../../store';

const initialState = {
  Ex: {
    E1: complex(2),
    E2: complex(3),
    E3: complex(-5),
  },
  Ax: {
    AL: [complex(6), complex(5)],
    AR: [complex(3), complex(2)],
  },
};

export const solverConfigSlice = createSlice({
  name: 'solverConfig',
  initialState,
  reducers: {
    setSolverConfigExC(
      state,
      action: PayloadAction<{
        cValue: Complex;
        Ex: keyof Ex;
      }>
    ) {
      const { cValue, Ex } = action.payload;
      state.Ex[Ex] = [...cValue];
      // TODO invalidate all results?
    },

    setSolverConfigAxN(state, action: PayloadAction<{ N: number }>) {
      const { N } = action.payload;
      const prevN = state.Ax.AL.length;

      if (prevN < N) {
        state.Ax.AL.push(complex(0));
        state.Ax.AR.push(complex(0));
      } else if (prevN > N && N > 0) {
        state.Ax.AL.pop();
        state.Ax.AR.pop();
      }
    },

    setSolverConfigAxArrayC(
      state,
      action: PayloadAction<{
        cValue: Complex;
        axCIndex: number;
        Ax: keyof Ax;
      }>
    ) {
      const { cValue, axCIndex, Ax } = action.payload;
      state.Ax[Ax][axCIndex] = [...cValue];
      // TODO invalidate all results?
    },
  },
});

// Selectors
export const selectSolverConfig = (state: RootState) => state.solverConfig;
export const selectN = (state: RootState) => state.solverConfig.Ax.AL.length;

const { actions, reducer } = solverConfigSlice;

export const {
  setSolverConfigExC,
  setSolverConfigAxN,
  setSolverConfigAxArrayC,
} = actions;

export default reducer;
