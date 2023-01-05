import { AppDispatch } from './../../store';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  EntityId,
  PayloadAction,
  Dictionary,
} from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import simplifyPath from 'simplify-js';

// @ts-ignore
import calcWorker from 'workerize-loader!../../../support/calc/calc';

import {
  Ax,
  Ex,
  ResultsInQArray,
  solveInQArray,
} from '../../../support/calc/calc';
import { getDifferentColor, getNextColorWithBuffer } from '../../../util/color';
import {
  complex,
  Complex,
  getRandomNumberBetween,
} from '../../../util/complex';
import { RootState } from '../../store';
import {
  AppState,
  OutputProjectionVariant,
  Sheet,
  SheetId,
  XSeed,
  XSeedId,
  DrawingPoint,
  XSeedValue,
  Result,
  StageId,
  Stage,
} from './types';
import { dataLayerDefaultScaleDownFactor } from '../../../const';
import { valueToProjectedValue } from './resultValueProjection';

const SIMPLIFY_INITIAL = -1.5;

export function getRandomXSeedPartNumber(): number {
  return getRandomNumberBetween(-10, 10);
}

function getRandomXSeedNumber(): Complex {
  return [getRandomXSeedPartNumber(), getRandomXSeedPartNumber()];
}

interface EntityWithId {
  id: EntityId;
}

function entitiesToEntityState<T extends EntityWithId>(
  entities: T[]
): EntityState<T> {
  return {
    ids: entities.map((entity) => entity.id),
    entities: entities.reduce((acc: Dictionary<T>, entity) => {
      acc[entity.id] = entity;
      return acc;
    }, {}),
  };
}

const sheetsAdapter = createEntityAdapter<Sheet>();
const xSeedsAdapter = createEntityAdapter<XSeed>();
const stagesAdapter = createEntityAdapter<Stage>();

// TODO extract initial state data and build functions
function buildInitialStage(id: StageId): Stage {
  return {
    id,
    width: 0,
    height: 0,
    dataLayer: {
      intialized: false,
      scale: 0,
      x: 0,
      y: 0,
    },
  };
}

function buildInitialSheet(
  sheet: Partial<Sheet> & Pick<Sheet, 'inputStageId' | 'outputStageId'>
): Sheet {
  return {
    id: 1,
    inputDrawingPoints: [],
    inputSimplifyTolerance: SIMPLIFY_INITIAL,
    inputSimplifyEnabled: true,
    qArray: [],
    qArrayValid: true,
    xSeedIds: [],
    xSeedHasError: false,
    ...sheet,
  };
}

export const solveActiveSheet = createAsyncThunk<
  Array<{
    xSeedId: XSeedId;
    resultsInQArray: ResultsInQArray;
  }>,
  void,
  {
    state: RootState;
    dispatch: AppDispatch;
  }
>('app/solveActiveSheet', async (_, { getState }) => {
  const {
    app: { xSeeds, sheets, activeSheetId, calcConfig },
  } = getState();
  const activeSheet = sheets.entities[activeSheetId];
  if (!activeSheet) throw new Error('Sheet not found');

  const activeSheetXSeeds = activeSheet.xSeedIds.map((activeSheetXSeedId) => {
    const xSeed = xSeeds.entities[activeSheetXSeedId];
    if (!xSeed) throw new Error('xSeed not found');
    return xSeed;
  });

  const workers = activeSheetXSeeds.map((xSeed) => {
    const calcWorkerInstance = calcWorker();
    return calcWorkerInstance.solveInQArray(
      xSeed.value,
      activeSheet.qArray,
      calcConfig
    );
  });
  const allResults = (await Promise.all(workers)) as ResultsInQArray[];
  return allResults.map((resultsInQArray, resultIndex) => ({
    xSeedId: activeSheetXSeeds[resultIndex].id,
    resultsInQArray,
  }));
});

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

function calculateSheetQArray(sheet: Sheet): Complex[] {
  return getQArrayFromInputDrawingPoints(
    sheet.inputDrawingPoints,
    sheet.inputSimplifyTolerance,
    sheet.inputSimplifyEnabled
  );
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

function centerEmptyStageDataLayer(state: AppState, id: StageId) {
  const stage = state.stages.entities[id];
  if (!stage) throw new Error('Stage not found');

  const stageMinSize = Math.min(stage.width, stage.height);
  const scale = (stageMinSize / 2) * dataLayerDefaultScaleDownFactor;
  const x = stage.width / 2;
  const y = stage.height / 2;

  stage.dataLayer.scale = scale;
  stage.dataLayer.x = x;
  stage.dataLayer.y = y;
}

function centerStageDataLayerOnValues(
  state: AppState,
  id: StageId,
  values: Complex[]
) {
  const stage = state.stages.entities[id];
  if (!stage) throw new Error('Stage not found');

  const { minX, maxX, minY, maxY } = values.reduce(
    (acc, value) => {
      const [x, y] = value;
      return {
        minX: Math.min(acc.minX, x),
        maxX: Math.max(acc.maxX, x),
        minY: Math.min(acc.minY, y),
        maxY: Math.max(acc.maxY, y),
      };
    },
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );

  const valuesWidth = maxX - minX;
  const valuesHeight = maxY - minY;

  const zoomFactor =
    Math.min(stage.height / valuesHeight, stage.width / valuesWidth) *
    dataLayerDefaultScaleDownFactor;

  const stageCenterX = stage.width / 2;
  const stageCenterY = stage.height / 2;

  const valuesCenterX = (minX + valuesWidth / 2) * zoomFactor;
  const valuesCenterY = -(minY + valuesHeight / 2) * zoomFactor; // flip y axis

  stage.dataLayer.scale = zoomFactor;
  stage.dataLayer.x = stageCenterX - valuesCenterX;
  stage.dataLayer.y = stageCenterY - valuesCenterY;
}

function centerSheetOutputStageResults(state: AppState, id: SheetId) {
  const sheet = state.sheets.entities[id];
  // TODO add utility
  if (!sheet) throw new Error('Sheet not found');

  const { xSeedIds, outputStageId, qArray } = sheet;

  const xSeeds = xSeedIds.map((xSeedId) => {
    const xSeed = state.xSeeds.entities[xSeedId];
    // TODO add utility
    if (!xSeed) throw new Error('xSeed not found');
    return xSeed;
  });

  const projectedValues = xSeeds.flatMap((xSeed) =>
    xSeed.results.flatMap((result) =>
      result.values.map((value, valueIndex) =>
        valueToProjectedValue(
          value,
          qArray[valueIndex],
          state.outputProjectionVariant
        )
      )
    )
  );

  if (projectedValues.length > 0) {
    centerStageDataLayerOnValues(state, outputStageId, projectedValues);
  } else {
    centerEmptyStageDataLayer(state, outputStageId);
  }
}

const initialXSeeds: XSeed[] = [
  {
    id: uuidv4(),
    value: [complex(2, -3), complex(3, -2)],
    color: 'rgb(0, 127, 255)',
    results: [],
    resultsValid: false,
  },
  {
    id: uuidv4(),
    value: [complex(2, 3), complex(2, 4)],
    color: 'rgb(255, 127, 0)',
    results: [],
    resultsValid: false,
  },
];

const initialSheetInputStage = buildInitialStage(uuidv4());

const initialSheetOutputStage = buildInitialStage(uuidv4());

const initialSheets = [
  buildInitialSheet({
    id: 1,
    xSeedIds: [initialXSeeds[0].id, initialXSeeds[1].id],
    inputStageId: initialSheetInputStage.id,
    outputStageId: initialSheetOutputStage.id,
  }),
];

const initialState: AppState = {
  sheets: entitiesToEntityState(initialSheets),
  xSeeds: entitiesToEntityState(initialXSeeds),
  stages: entitiesToEntityState([
    initialSheetInputStage,
    initialSheetOutputStage,
  ]),
  solvingInProgress: false,
  activeSheetId: 1,
  outputProjectionVariant: OutputProjectionVariant.V1,
  calcConfig: {
    Ex: {
      E1: complex(2),
      E2: complex(3),
      E3: complex(-5),
    },
    Ax: {
      AL: [complex(6), complex(5)],
      AR: [complex(3), complex(2)],
    },
  },
  badPoints: [
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

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    resizeStage: (
      state,
      action: PayloadAction<{
        id: StageId;
        stageWidth: number;
        stageHeight: number;
      }>
    ) => {
      const { id, stageWidth, stageHeight } = action.payload;

      const stage = state.stages.entities[id];
      if (!stage) throw new Error('Stage not found');

      stage.width = stageWidth;
      stage.height = stageHeight;

      if (!stage.dataLayer.intialized) {
        centerEmptyStageDataLayer(state, id);
        stage.dataLayer.intialized = true;
      }
    },

    updateStageDataLayerPosition: (
      state,
      action: PayloadAction<{
        id: StageId;
        x: number;
        y: number;
      }>
    ) => {
      const { id, x, y } = action.payload;
      const stage = state.stages.entities[id];
      if (!stage) throw new Error('Stage not found');

      stage.dataLayer.x = x;
      stage.dataLayer.y = y;
    },

    zoomStageDataLayerWithWheel: (
      state,
      action: PayloadAction<{
        id: StageId;
        wheelDeltaY: number;
        pointerX: number;
        pointerY: number;
      }>
    ) => {
      const { id, wheelDeltaY, pointerX, pointerY } = action.payload;
      const stage = state.stages.entities[id];
      if (!stage) throw new Error('Stage not found');

      const { dataLayer } = stage;

      const scaleBy = 0.95;
      const oldScale = dataLayer.scale;
      const oldX = dataLayer.x;
      const oldY = dataLayer.y;

      const mousePointTo = {
        x: pointerX / oldScale - oldX / oldScale,
        y: pointerY / oldScale - oldY / oldScale,
      };

      const newScale =
        wheelDeltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

      dataLayer.scale = newScale;
      dataLayer.x = -(mousePointTo.x - pointerX / newScale) * newScale;
      dataLayer.y = -(mousePointTo.y - pointerY / newScale) * newScale;
    },

    scaleStageDataLayer: (
      state,
      action: PayloadAction<{
        id: StageId;
        scaleFactor: number;
      }>
    ) => {
      const { id, scaleFactor } = action.payload;
      const stage = state.stages.entities[id];
      if (!stage) throw new Error('Stage not found');

      stage.dataLayer.scale *= scaleFactor;
    },

    panStageDataLayer: (
      state,
      action: PayloadAction<{
        id: StageId;
        panX?: number;
        panY?: number;
      }>
    ) => {
      const { id, panX, panY } = action.payload;
      const stage = state.stages.entities[id];
      if (!stage) throw new Error('Stage not found');

      const { dataLayer } = stage;

      if (typeof panX !== 'undefined') dataLayer.x += panX;
      if (typeof panY !== 'undefined') dataLayer.y += panY;
    },

    // kept prformance testing only (having issues with worker profiling)
    calculateAllOutputPaths: (state) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      const xSeedIds = activeSheet.xSeedIds;

      const xSeedUpdates = xSeedIds.map((xSeedId) => {
        const xSeed = state.xSeeds.entities[xSeedId]?.value;
        if (!xSeed) throw new Error('xSeed not found');

        const resultsInQArray = solveInQArray(
          xSeed,
          activeSheet.qArray,
          state.calcConfig
        );

        const results: Result[] = resultsInQArray.map((values) => ({
          values,
          selected: true,
        }));

        return {
          id: xSeedId,
          changes: {
            results,
            resultsValid: true,
          },
        };
      });

      xSeedsAdapter.updateMany(state.xSeeds, xSeedUpdates);
    },

    clearActiveSheetInputOutputValues: (state) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      // TODO stop using update functions where too verbose
      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          inputDrawingPoints: [],
          qArray: [],
          qArrayValid: true,
        },
      });

      const xSeedIds = activeSheet.xSeedIds;
      xSeedsAdapter.updateMany(
        state.xSeeds,
        xSeedIds.map((xSeedId) => ({
          id: xSeedId,
          changes: {
            results: [],
            resultsValid: false,
          },
        }))
      );

      centerEmptyStageDataLayer(state, activeSheet.inputStageId);
      centerEmptyStageDataLayer(state, activeSheet.outputStageId);
    },

    updateActiveSheetQArray: (state) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      const qArray = calculateSheetQArray(activeSheet);

      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          qArray,
          qArrayValid: true,
        },
      });
    },

    setXSeedsValues: (state, action: PayloadAction<XSeedValue[]>) => {
      // optimized to not re-render if the values are the same and the ouput is valid
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      const payloadXSeedsValues = action.payload;
      const xSeedIds = activeSheet.xSeedIds;

      // update (or remove) existing xSeeds
      xSeedIds.forEach((xSeedId, xSeedIdIndex) => {
        if (xSeedIdIndex < payloadXSeedsValues.length) {
          const xSeed = state.xSeeds.entities[xSeedId];
          if (!xSeed) throw new Error('xSeed not found');
          const newXSeed = payloadXSeedsValues[xSeedIdIndex];
          xSeedsAdapter.updateOne(state.xSeeds, {
            id: xSeedId,
            changes: {
              value: newXSeed,
              resultsValid: false,
            },
          });
        } else {
          // if there's more xSeeds than xSeed values in payload, remove the extra xSeeds
          xSeedsAdapter.removeOne(state.xSeeds, xSeedId);
          sheetsAdapter.updateOne(state.sheets, {
            id: state.activeSheetId,
            changes: {
              xSeedIds: activeSheet.xSeedIds.filter((id) => id !== xSeedId),
            },
          });
        }
      });

      // add new xSeeds if there's more xSeed values in payload than xSeeds
      const newXSeedValues = payloadXSeedsValues.slice(xSeedIds.length);
      if (newXSeedValues.length > 0) {
        // fill the colors buffer with the colors of the existing xSeeds
        const colorsBuffer = xSeedIds.map((xSeedId) => {
          const color = state.xSeeds.entities[xSeedId]?.color;
          if (!color) throw new Error('xSeed not found');
          return color;
        });

        const newXSeeds: XSeed[] = newXSeedValues.map((newXSeedValue) => ({
          id: uuidv4(),
          value: newXSeedValue,
          results: [],
          resultsValid: false,
          color: getNextColorWithBuffer(colorsBuffer),
        }));

        xSeedsAdapter.addMany(state.xSeeds, newXSeeds);

        sheetsAdapter.updateOne(state.sheets, {
          id: state.activeSheetId,
          changes: {
            xSeedIds: [...xSeedIds, ...newXSeeds.map((xSeed) => xSeed.id)],
          },
        });
      }
    },

    setXSeedsM: (state, action: PayloadAction<number>) => {
      const M = action.payload;

      const updates = state.xSeeds.ids.map((xSeedId) => {
        const xSeedValue = state.xSeeds.entities[xSeedId]?.value;
        if (!xSeedValue) throw new Error('xSeed not found');

        return {
          id: xSeedId,
          changes: {
            value:
              xSeedValue.length < M
                ? [
                    ...xSeedValue,
                    ...new Array(M - xSeedValue.length)
                      .fill(null)
                      .map((_) => getRandomXSeedNumber()),
                  ]
                : xSeedValue.slice(0, M),
            resultsValid: false,
          },
        };
      });
      xSeedsAdapter.updateMany(state.xSeeds, updates);
    },

    addXSeedToActiveSheet: (state) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      const xSeedIds = activeSheet.xSeedIds;
      const xSeeds = xSeedIds.map((xSeedId) => {
        const xSeed = state.xSeeds.entities[xSeedId];
        if (!xSeed) throw new Error('xSeed not found');
        return xSeed;
      });

      const M = xSeeds[0].value.length;

      const previousColors = xSeeds.map((xSeeds) => xSeeds.color);

      const newXSeed: XSeed = {
        id: uuidv4(),
        value: new Array(M).fill(null).map(() => getRandomXSeedNumber()),
        color: getDifferentColor(previousColors),
        results: [],
        resultsValid: false,
      };

      xSeedsAdapter.addOne(state.xSeeds, newXSeed);
      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          xSeedIds: [...xSeedIds, newXSeed.id],
        },
      });
    },

    removeXSeedFromActiveSheet: (state, action: PayloadAction<XSeedId>) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      const xSeedId = action.payload;

      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          xSeedIds: activeSheet.xSeedIds.filter((id) => id !== xSeedId),
        },
      });
      xSeedsAdapter.removeOne(state.xSeeds, xSeedId);
    },

    setXSeedNumber: (
      state,
      action: PayloadAction<{
        xSeedId: XSeedId;
        xSeedNumberIndex: number;
        value: Complex;
      }>
    ) => {
      const { xSeedId, xSeedNumberIndex, value } = action.payload;

      const draftXSeed = state.xSeeds.entities[xSeedId]?.value;
      if (!draftXSeed) throw new Error('xSeed not found');

      draftXSeed[xSeedNumberIndex] = value;

      const update = {
        id: xSeedId,
        changes: {
          xSeed: draftXSeed,
          resultsValid: false,
        },
      };

      xSeedsAdapter.updateOne(state.xSeeds, update);
    },

    setXSeedColor: (
      state,
      action: PayloadAction<{
        xSeedId: XSeedId;
        color: string;
      }>
    ) => {
      const { xSeedId, color } = action.payload;

      const update = {
        id: xSeedId,
        changes: {
          color,
        },
      };

      xSeedsAdapter.updateOne(state.xSeeds, update);
    },

    // TODO use new format
    setBadPoints: (state, action: PayloadAction<Complex[]>) => {
      state.badPoints = action.payload;
    },

    addSheet: (state) => {
      const lastSheetId = Number(state.sheets.ids[state.sheets.ids.length - 1]);
      const lastSheetXSeedIds = state.sheets.entities[lastSheetId]?.xSeedIds;
      if (!lastSheetXSeedIds) throw new Error('Sheet not found');

      const newSheetId = lastSheetId + 1;

      const newXSeeds: XSeed[] = lastSheetXSeedIds.map((lastSheetXSeedId) => {
        const lastSheetXSeed = state.xSeeds.entities[lastSheetXSeedId];
        if (!lastSheetXSeed) throw new Error('xSeed not found');

        return {
          id: uuidv4(),
          results: [],
          resultsValid: false,
          color: lastSheetXSeed.color,
          value:
            lastSheetXSeed.results.length > 0 && lastSheetXSeed.resultsValid
              ? lastSheetXSeed.results.map(
                  (result) => result.values[result.values.length - 1]
                )
              : lastSheetXSeed.value,
        };
      });

      xSeedsAdapter.addMany(state.xSeeds, newXSeeds);

      const newInputStage = buildInitialStage(uuidv4());
      const newOutputStage = buildInitialStage(uuidv4());

      stagesAdapter.addMany(state.stages, [newInputStage, newOutputStage]);

      const newSheet = buildInitialSheet({
        id: newSheetId,
        xSeedIds: newXSeeds?.map((xSeed) => xSeed.id),
        inputStageId: newInputStage.id,
        outputStageId: newOutputStage.id,
      });

      sheetsAdapter.addOne(state.sheets, newSheet);

      state.activeSheetId = newSheetId;
    },

    setActiveSheetId: (state, action: PayloadAction<SheetId>) => {
      state.activeSheetId = action.payload;
    },

    removeSheetWithId: (state, action: PayloadAction<SheetId>) => {
      const removedSheetId = action.payload;
      const removedSheet = state.sheets.entities[removedSheetId];
      if (!removedSheet) throw new Error('Sheet not found');

      stagesAdapter.removeMany(state.stages, [
        removedSheet.inputStageId,
        removedSheet.outputStageId,
      ]);

      const activeSheetIndex = state.sheets.ids.indexOf(state.activeSheetId);

      if (state.activeSheetId === removedSheetId) {
        state.activeSheetId =
          state.sheets.ids[activeSheetIndex - 1] ??
          state.sheets.ids[activeSheetIndex + 1];
      }

      sheetsAdapter.removeOne(state.sheets, removedSheetId);
    },

    addActiveSheetInputDrawingPoint: (
      state,
      action: PayloadAction<DrawingPoint>
    ) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      activeSheet.inputDrawingPoints.push(action.payload);
      activeSheet.qArrayValid = false;

      // invalidate output values on subsequent drawing
      const updates = activeSheet.xSeedIds.map((xSeedId) => ({
        id: xSeedId,
        changes: {
          resultsValid: false,
        },
      }));
      xSeedsAdapter.updateMany(state.xSeeds, updates);
    },

    setInputSimplifyTolerance: (state, action: PayloadAction<number>) => {
      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          inputSimplifyTolerance: action.payload,
          qArrayValid: false,
        },
      });
      const updates = state.xSeeds.ids.map((xSeedId) => ({
        id: xSeedId,
        changes: {
          resultsValid: false,
        },
      }));
      xSeedsAdapter.updateMany(state.xSeeds, updates);
    },

    setInputSimplifyEnabled: (state, action: PayloadAction<boolean>) => {
      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: {
          inputSimplifyEnabled: action.payload,
          qArrayValid: false,
        },
      });
      const updates = state.xSeeds.ids.map((xSeedId) => ({
        id: xSeedId,
        changes: {
          resultsValid: false,
        },
      }));
      xSeedsAdapter.updateMany(state.xSeeds, updates);
    },

    setOutputProjectionVariant: (
      state,
      action: PayloadAction<OutputProjectionVariant>
    ) => {
      state.outputProjectionVariant = action.payload;

      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      centerSheetOutputStageResults(state, state.activeSheetId);
    },

    setCalcConfigExC(
      state,
      action: PayloadAction<{
        cValue: Complex;
        Ex: keyof Ex;
      }>
    ) {
      const { cValue, Ex } = action.payload;
      state.calcConfig.Ex[Ex] = [...cValue];
      const updates = state.xSeeds.ids.map((xSeedId) => ({
        id: xSeedId,
        changes: {
          resultsValid: false,
        },
      }));
      xSeedsAdapter.updateMany(state.xSeeds, updates);
    },

    setCalcConfigAxN(state, action: PayloadAction<{ N: number }>) {
      const { N } = action.payload;
      const prevN = state.calcConfig.Ax.AL.length;

      if (prevN < N) {
        state.calcConfig.Ax.AL.push(complex(0));
        state.calcConfig.Ax.AR.push(complex(0));
      } else if (prevN > N && N > 0) {
        state.calcConfig.Ax.AL.pop();
        state.calcConfig.Ax.AR.pop();
      }
    },

    setCalcConfigAxArrayC(
      state,
      action: PayloadAction<{
        cValue: Complex;
        axCIndex: number;
        Ax: keyof Ax;
      }>
    ) {
      const { cValue, axCIndex, Ax } = action.payload;
      state.calcConfig.Ax[Ax][axCIndex] = [...cValue];
      const updates = state.xSeeds.ids.map((xSeedId) => ({
        id: xSeedId,
        changes: {
          resultsValid: false,
        },
      }));
      xSeedsAdapter.updateMany(state.xSeeds, updates);
    },

    activeSheetXSeedHasError(state, action: PayloadAction<boolean>) {
      sheetsAdapter.updateOne(state.sheets, {
        id: state.activeSheetId,
        changes: { xSeedHasError: action.payload },
      });
    },

    selectSingleXSeedResult(
      state,
      action: PayloadAction<{ xSeedId: XSeedId; resultIndex: number }>
    ) {
      const { payload } = action;

      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      activeSheet.xSeedIds.forEach((xSeedId) => {
        state.xSeeds.entities[xSeedId]?.results.forEach(
          (result, resultIndex) => {
            result.selected =
              xSeedId === payload.xSeedId &&
              resultIndex === payload.resultIndex;
          }
        );
      });
    },

    selectAllXSeedResults(
      state,
      action: PayloadAction<{ xSeedIds: XSeedId[] }>
    ) {
      const { xSeedIds } = action.payload;

      xSeedIds.forEach((xSeedId) => {
        const xSeed = state.xSeeds.entities[xSeedId];
        if (!xSeed) throw new Error('xSeed not found');

        xSeed.results.forEach((result) => {
          result.selected = true;
        });
      });
    },

    toggleXSeedResultSelected(
      state,
      action: PayloadAction<{ xSeedId: XSeedId; resultIndex: number }>
    ) {
      const { xSeedId, resultIndex } = action.payload;

      const xSeed = state.xSeeds.entities[xSeedId];
      if (!xSeed) throw new Error('xSeed not found');

      xSeed.results[resultIndex].selected =
        !xSeed.results[resultIndex].selected;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(solveActiveSheet.pending, (state) => {
      state.solvingInProgress = true;
    });
    builder.addCase(solveActiveSheet.rejected, (state, action) => {
      state.solvingInProgress = false;
      console.log(action);
    });
    builder.addCase(solveActiveSheet.fulfilled, (state, action) => {
      const activeSheet = state.sheets.entities[state.activeSheetId];
      if (!activeSheet) throw new Error('Sheet not found');

      state.solvingInProgress = false;

      const allResultsInQArray = action.payload;

      const updates = allResultsInQArray.map(
        ({ xSeedId: xSeedId, resultsInQArray }) => ({
          id: xSeedId,
          changes: {
            results: resultsInQArray.map((values) => ({
              values,
              selected: true,
            })),
            resultsValid: true,
          },
        })
      );

      xSeedsAdapter.updateMany(state.xSeeds, updates);

      centerSheetOutputStageResults(state, activeSheet.id);
    });
  },
});

// Selectors
export const selectSolvingInprogress = (state: RootState) =>
  state.app.solvingInProgress;

export const selectBadPoints = (state: RootState) => state.app.badPoints;

export const selectCalcConfig = (state: RootState) => state.app.calcConfig;
export const selectN = (state: RootState) => state.app.calcConfig.Ax.AL.length;

export const selectM = (state: RootState) => {
  const firstXSeed = state.app.xSeeds.entities[state.app.xSeeds.ids[0]];
  if (!firstXSeed) throw new Error('No xSeeds found');
  return firstXSeed.value.length;
};

export const selectOutputProjectionVariant = (state: RootState) =>
  state.app.outputProjectionVariant;

export const selectTabsData = (state: RootState) => ({
  activeSheetId: state.app.activeSheetId,
  sheetIds: state.app.sheets.ids,
});

export const selectStageById = (state: RootState, id: StageId) => {
  const stage = state.app.stages.entities[id];
  if (!stage) throw new Error('Stage not found');
  return stage;
};

const selectActiveSheet = (state: RootState) => {
  const activeSheet = state.app.sheets.entities[state.app.activeSheetId];
  if (!activeSheet) throw new Error('Sheet not found');
  return activeSheet;
};

const selectPreviousSheet = (state: RootState) => {
  const activeSheetId = state.app.activeSheetId;
  const activeSheetIndex = state.app.sheets.ids.indexOf(activeSheetId);
  const previousSheetId = state.app.sheets.ids[activeSheetIndex - 1];
  return state.app.sheets.entities[previousSheetId];
};

export const selectActiveSheetXSeedHasError = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.xSeedHasError
);

export const selectActiveSheetIputDrawingPoints = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.inputDrawingPoints
);

export const selectActiveSheetQArray = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.qArray
);

export const selectActiveSheetQArrayValid = createSelector(
  [selectActiveSheet],
  (activeSheet) => activeSheet.qArrayValid
);

export const selectOutputAreaData = createSelector(
  [
    selectActiveSheet,
    selectActiveSheetQArray,
    selectOutputProjectionVariant,
    (state: RootState) => state.app.xSeeds,
  ],
  (
    activeSheet,
    qArray,
    projectionVariant,
    xSeeds
  ): {
    xSeeds: Array<
      Pick<XSeed, 'id' | 'color' | 'resultsValid'> & {
        results: Array<
          Pick<Result, 'selected'> & {
            projectedValues: Complex[];
          }
        >;
      }
    >;
  } => {
    const activeSheetXSeeds = activeSheet.xSeedIds.map((xSeedId) => {
      const xSeed = xSeeds.entities[xSeedId];
      if (!xSeed) throw new Error('xSeed not found');
      return xSeed;
    });

    return {
      xSeeds: activeSheetXSeeds.map((xSeed) => ({
        id: xSeed.id,
        color: xSeed.color,
        resultsValid: xSeed.resultsValid,
        results: xSeed.results.map((result) => ({
          projectedValues: result.values.map((value, valueIndex) =>
            valueToProjectedValue(value, qArray[valueIndex], projectionVariant)
          ),
          selected: result.selected,
        })),
      })),
    };
  }
);

export const selectXSeedEditorData = createSelector(
  [selectActiveSheet, (state: RootState) => state.app.xSeeds],
  (
    activeSheet,
    xSeeds
  ): {
    allXSeedsCalculated: boolean;
    xSeedsRemovalDisabled: boolean;
    xSeeds: Array<
      Pick<XSeed, 'id' | 'color' | 'value' | 'resultsValid'> & {
        resultsStarts: Complex[];
        resultsEnds: Complex[];
      }
    >;
    allXSeedResultsStarts: Complex[][];
    allXSeedResultsEnds: Complex[][];
  } => {
    const activeSheetXSeeds: XSeed[] = activeSheet.xSeedIds.map((xSeedId) => {
      const xSeed = xSeeds.entities[xSeedId];
      if (!xSeed) throw new Error('xSeed not found');
      return xSeed;
    });

    return {
      allXSeedsCalculated: !activeSheetXSeeds.some(
        (xSeed) => xSeed.results.length === 0
      ),
      xSeedsRemovalDisabled: activeSheetXSeeds.length < 2,
      xSeeds: activeSheetXSeeds.map((xSeed) => ({
        id: xSeed.id,
        color: xSeed.color,
        value: xSeed.value,
        resultsValid: xSeed.resultsValid,
        resultsStarts: xSeed.results.map((result) => result.values[0]),
        resultsEnds: xSeed.results.map(
          (result) => result.values[result.values.length - 1]
        ),
      })),
      allXSeedResultsStarts: activeSheetXSeeds.map((xSeed) => {
        const results = xSeed.results;
        if (!results) throw new Error('Results not found');
        return results.map((result) => result.values[0]);
      }),
      allXSeedResultsEnds: activeSheetXSeeds.map((xSeed) => {
        const results = xSeed.results;
        if (!results) throw new Error('results not found');
        return results.map((result) => result.values[result.values.length - 1]);
      }),
    };
  }
);

export const selectActiveSheetInputSimplifyConfig = createSelector(
  [selectActiveSheet],
  (activeSheet) => ({
    enabled: activeSheet.inputSimplifyEnabled,
    tolerance: activeSheet.inputSimplifyTolerance,
  })
);

export const selectPreviousSheetQn = createSelector(
  [selectPreviousSheet],
  (previousSheet) => {
    if (!previousSheet) return undefined;
    return previousSheet.qArray[previousSheet.qArray.length - 1];
  }
);

export const selectActiveSheetStageIds = createSelector(
  [selectActiveSheet],
  (activeSheet) => ({
    inputStageId: activeSheet.inputStageId,
    outputStageId: activeSheet.outputStageId,
  })
);

const { actions, reducer } = appSlice;

export const {
  addActiveSheetInputDrawingPoint,
  resizeStage,
  updateStageDataLayerPosition,
  zoomStageDataLayerWithWheel,
  scaleStageDataLayer,
  panStageDataLayer,
  updateActiveSheetQArray,
  addSheet,
  addXSeedToActiveSheet,
  clearActiveSheetInputOutputValues,
  removeSheetWithId,
  removeXSeedFromActiveSheet,
  setActiveSheetId,
  setBadPoints,
  setInputSimplifyEnabled,
  setInputSimplifyTolerance,
  setOutputProjectionVariant,
  setXSeedColor,
  setXSeedNumber,
  setXSeedsM,
  setXSeedsValues,
  setCalcConfigExC,
  setCalcConfigAxN,
  setCalcConfigAxArrayC,
  selectSingleXSeedResult,
  selectAllXSeedResults,
  toggleXSeedResultSelected,
  activeSheetXSeedHasError,
} = actions;

export default reducer;
