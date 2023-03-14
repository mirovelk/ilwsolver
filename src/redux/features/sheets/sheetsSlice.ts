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
import { selectActiveSheet } from '../../selectors/selectActiveSheet';

import { RootState } from '../../store';

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
  inputDrawingPoints: DrawingPoint[]; // TODO separate slice
  qArray: Complex[]; // TODO selector? derived from inputDrawingPoints afer simplify, kept for performance
  qArrayValid: boolean; // qArray can be invalid if inputDrawingPoints changed and needs to be recalculated
  inputStageId: StageId;
  outputStageId: StageId;
  xSeedIds: XSeedId[];
}

export const initialSheet: Sheet = {
  id: 1, // also used as a label
  inputSimplifyTolerance: SIMPLIFY_INITIAL,
  inputSimplifyEnabled: true,
  inputDrawingPoints: [],
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

function getSimplifiedSmoothedInputLinePoints(
  inputLinePoints: DrawingPoint[],
  inputSimplifyTolerance: number
): DrawingPoint[] {
  // simplify
  return simplifyPath(
    inputLinePoints.map((point) => ({ x: point[0], y: point[1] })),
    Math.pow(10, inputSimplifyTolerance),
    true
  ).map((point) => [point.x, point.y]);

  // smooth
  // TODO add smooothing/interpolation
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
      sheetsAdapter.addOne(state, {
        ...initialSheet,
        ...action.payload,
        xSeedIds: action.payload.xSeeds.map((xSeed) => xSeed.xSeedId),
      });
      state.activeSheetId = action.payload.id;
    },

    removeSheet: (state, action: PayloadAction<SheetId>) => {
      const removedSheetId = action.payload;
      const removedSheet = state.entities[removedSheetId];
      if (!removedSheet) throw new Error('Sheet not found');

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

    updateSheetQArray: (state, action: PayloadAction<{ sheetId: SheetId }>) => {
      const sheet = state.entities[action.payload.sheetId];
      if (!sheet) throw new Error('Sheet not found');

      const qArray = getQArrayFromInputDrawingPoints(
        sheet.inputDrawingPoints,
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

    addInputDrawingPoint(
      state,
      action: PayloadAction<{ sheetId: SheetId; point: [number, number] }>
    ) {
      const { sheetId, point } = action.payload;
      const sheet = state.entities[sheetId];
      if (!sheet) throw new Error('Sheet not found');

      sheet.inputDrawingPoints.push(point);
      sheet.qArrayValid = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearInputOutputValues, (state, action) => {
      const { sheetId } = action.payload;
      const sheet = state.entities[sheetId];
      if (!sheet) throw new Error('Sheet not found');

      sheet.inputDrawingPoints = [];
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

// TODO move active sheet selectors?
export const selectActiveSheetId = (state: RootState) =>
  state.sheets.activeSheetId;

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

export const selectActiveSheetIputDrawingPoints = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.inputDrawingPoints
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

export const selectActiveSheetStageIds = createSelector(
  [selectActiveSheet],
  (activeSheet) => ({
    inputStageId: activeSheet.inputStageId,
    outputStageId: activeSheet.outputStageId,
  })
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
  addInputDrawingPoint,
} = actions;

export default reducer;
