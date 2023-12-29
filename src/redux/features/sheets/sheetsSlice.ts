import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityId,
  PayloadAction,
} from '@reduxjs/toolkit';
import simplifyPath from 'simplify-js';

import { Complex } from '../../../util/complex';
import { required } from '../../../util/required';
import { clearInputOutputValues } from '../../actions';

import { RootState } from '../../store';
import { ResultId } from '../results/resultsSlice';

import { initialStages, StageId } from '../stages/stagesSlice';
import {
  addXSeed,
  AddXSeedPayload,
  initialXSeeds,
  removeXSeed,
  XSeedId,
} from '../xSeeds/xSeedsSlice';

const SIMPLIFY_INITIAL = -1.5;

export type SheetId = EntityId;

export type DrawingPoint = [number, number];

export interface Sheet {
  id: SheetId;
  inputSimplifyTolerance: number;
  inputSimplifyEnabled: boolean;
  qArray: Complex[]; // TODO selector? derived from inputDrawingPoints afer simplify
  qArrayValid: boolean; // TODO selector? qArray can be invalid if inputDrawingPoints changed and needs to be recalculated
  inputStageId: StageId;
  outputStageId: StageId;
  xSeedIds: XSeedId[];
}

export const initialSheet: Sheet = {
  id: 1, // also used as a label
  inputSimplifyTolerance: SIMPLIFY_INITIAL,
  inputSimplifyEnabled: true,
  qArray: [],
  qArrayValid: false,
  inputStageId: initialStages[0].id,
  outputStageId: initialStages[1].id,
  xSeedIds: initialXSeeds.map((xSeed) => xSeed.id),
};

const sheetsAdapter = createEntityAdapter<Sheet>();

const emptyInitilaState = sheetsAdapter.getInitialState({
  activeSheetId: initialSheet.id,
});
const filledInitialState = sheetsAdapter.addOne(
  emptyInitilaState,
  initialSheet
);

function getQArrayFromInputDrawingPoints(
  inputDrawingPoints: DrawingPoint[],
  inputSimplifyTolerance: number,
  inputSimplifyEnabled: boolean
): Complex[] {
  return inputSimplifyEnabled
    ? getSimplifiedSmoothedInputLinePoints(
        inputDrawingPoints,
        inputSimplifyTolerance
      )
    : inputDrawingPoints;
}

function getSmoothedInputLinePoints(
  inputLinePoints: DrawingPoint[],
  minimumPoints: number
): DrawingPoint[] {
  if (inputLinePoints.length < 2) {
    return inputLinePoints;
  }

  const output: DrawingPoint[] = [];

  // copy firts point
  if (inputLinePoints.length > 0) {
    const firstPoint = inputLinePoints[0];
    output.push([firstPoint[0], firstPoint[1]]);
  }

  // add smoothed points (Chaikins Algorithm https://www.cs.unc.edu/~dm/UNC/COMP258/LECTURES/Chaikins-Algorithm.pdf)
  for (let i = 0; i < inputLinePoints.length - 1; i++) {
    const p0 = inputLinePoints[i];
    const p1 = inputLinePoints[i + 1];
    const p0x = p0[0];
    const p0y = p0[1];
    const p1x = p1[0];
    const p1y = p1[1];

    const Q: DrawingPoint = [0.75 * p0x + 0.25 * p1x, 0.75 * p0y + 0.25 * p1y];
    const R: DrawingPoint = [0.25 * p0x + 0.75 * p1x, 0.25 * p0y + 0.75 * p1y];
    output.push(Q);
    output.push(R);
  }

  // copy last point
  if (inputLinePoints.length > 1) {
    const lastPoint = inputLinePoints[inputLinePoints.length - 1];
    output.push([lastPoint[0], lastPoint[1]]);
  }

  // repeat until minimum points reached
  return output.length < minimumPoints
    ? getSmoothedInputLinePoints(output, minimumPoints)
    : output;
}

function getSimplifiedSmoothedInputLinePoints(
  inputLinePoints: DrawingPoint[],
  inputSimplifyTolerance: number
): DrawingPoint[] {
  // simplify
  const simplified: DrawingPoint[] = simplifyPath(
    inputLinePoints.map((point) => ({ x: point[0], y: point[1] })),
    Math.pow(10, inputSimplifyTolerance),
    true
  ).map((point) => [point.x, point.y]);

  return getSmoothedInputLinePoints(simplified, 1000);
}

export const sheetsSlice = createSlice({
  name: 'sheets',
  initialState: filledInitialState,
  reducers: {
    setActiveSheetId: (state, action: PayloadAction<SheetId>) => {
      state.activeSheetId = action.payload;
    },

    addSheet: (
      state,
      action: PayloadAction<{
        id: SheetId;
        inputStageId: StageId;
        outputStageId: StageId;
        xSeeds: Array<AddXSeedPayload>;
      }>
    ) => {
      const { id, inputStageId, outputStageId, xSeeds } = action.payload;
      sheetsAdapter.addOne(state, {
        ...initialSheet,
        id,
        inputStageId,
        outputStageId,
        xSeedIds: xSeeds.map((xSeed) => xSeed.xSeedId),
      });
      state.activeSheetId = action.payload.id;
    },

    removeSheet: (
      state,
      action: PayloadAction<{
        sheetId: SheetId;
        xSeedIds: XSeedId[];
        stageIds: StageId[];
        resultIds: ResultId[];
      }>
    ) => {
      const removedSheetId = action.payload.sheetId;
      const activeSheetIndex = state.ids.indexOf(state.activeSheetId);

      if (state.activeSheetId === removedSheetId) {
        state.activeSheetId =
          state.ids[activeSheetIndex - 1] ?? state.ids[activeSheetIndex + 1];
      }

      sheetsAdapter.removeOne(state, removedSheetId);
    },

    setInputSimplifyTolerance: (
      state,
      action: PayloadAction<{
        sheetId: SheetId;
        inputSimplifyTolerance: number;
      }>
    ) => {
      const { sheetId, inputSimplifyTolerance } = action.payload;
      sheetsAdapter.updateOne(state, {
        id: sheetId,
        changes: {
          inputSimplifyTolerance,
        },
      });
    },

    setInputSimplifyEnabled: (
      state,
      action: PayloadAction<{ sheetId: SheetId; inputSimplifyEnabled: boolean }>
    ) => {
      const { sheetId, inputSimplifyEnabled } = action.payload;
      sheetsAdapter.updateOne(state, {
        id: sheetId,
        changes: {
          inputSimplifyEnabled,
        },
      });
    },

    updateSheetQArray: (
      state,
      action: PayloadAction<{
        sheetId: SheetId;
        inputDrawingPoints: DrawingPoint[];
      }>
    ) => {
      const sheet = state.entities[action.payload.sheetId];
      if (!sheet) throw new Error('Sheet not found');

      const qArray = getQArrayFromInputDrawingPoints(
        action.payload.inputDrawingPoints,
        sheet.inputSimplifyTolerance,
        sheet.inputSimplifyEnabled
      );

      sheetsAdapter.updateOne(state, {
        id: state.activeSheetId,
        changes: {
          qArray,
          qArrayValid: true,
        },
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearInputOutputValues, (state, action) => {
      const { sheetId } = action.payload;
      const sheet = state.entities[sheetId];
      if (!sheet) throw new Error('Sheet not found');

      sheet.qArray = [];
      sheet.qArrayValid = false;
    });
    builder.addCase(addXSeed, (state, action) => {
      const { sheetId, xSeedId } = action.payload;
      const sheet = required(state.entities[sheetId]);
      sheet.xSeedIds.push(xSeedId);
    });
    builder.addCase(removeXSeed, (state, action) => {
      const { sheetId, xSeedId } = action.payload;
      const sheet = required(state.entities[sheetId]);
      sheet.xSeedIds = sheet.xSeedIds.filter((id) => id !== xSeedId);
    });
  },
});

// Selectors
export const selectTabsData = (state: RootState) => ({
  activeSheetId: state.sheets.activeSheetId,
  sheetIds: state.sheets.ids,
});

export const selectSheetById = (state: RootState, sheetId: SheetId) => {
  const sheet = state.sheets.entities[sheetId];
  if (!sheet) throw new Error('Sheet not found');
  return sheet;
};

export const selectActiveSheetId = (state: RootState) =>
  state.sheets.activeSheetId;

export const selectActiveSheet = (state: RootState) => {
  return required(state.sheets.entities[state.sheets.activeSheetId]);
};

export const selectActiveSheetXSeedIds = (state: RootState) => {
  const activeSheet = required(
    state.sheets.entities[state.sheets.activeSheetId]
  );
  return activeSheet.xSeedIds;
};

// TODO do not select active sheet? can change reference
export const selectActiveSheetQArray = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.qArray // TODO separate slice/check performance
);

export const selectLastSheet = (state: RootState) => {
  const lastSheetId = state.sheets.ids[state.sheets.ids.length - 1];
  const lastSheet = state.sheets.entities[lastSheetId];
  if (!lastSheet) throw new Error('Sheet not found');
  return lastSheet;
};

const selectPreviousSheet = (state: RootState) => {
  const activeSheetId = state.sheets.activeSheetId;
  const activeSheetIndex = state.sheets.ids.indexOf(activeSheetId);
  const previousSheetId = state.sheets.ids[activeSheetIndex - 1];
  return state.sheets.entities[previousSheetId];
};

export const selectPreviousSheetQn = createSelector(
  [selectPreviousSheet],
  (previousSheet) => {
    if (!previousSheet) return undefined;
    return previousSheet.qArray[previousSheet.qArray.length - 1];
  }
);

export const selectActiveSheetInputSimplifyConfig = createSelector(
  [selectActiveSheet],
  (activeSheet) => ({
    enabled: activeSheet.inputSimplifyEnabled,
    tolerance: activeSheet.inputSimplifyTolerance,
  })
);

export const selectActiveSheetInputStageId = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.inputStageId
);

export const selectActiveSheetOutputStageId = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.outputStageId
);

export const selectActiveSheetQArrayValid = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.qArrayValid
);

const { actions, reducer } = sheetsSlice;

export const {
  setActiveSheetId,
  addSheet,
  removeSheet,
  setInputSimplifyEnabled,
  setInputSimplifyTolerance,
  updateSheetQArray,
} = actions;

export default reducer;
