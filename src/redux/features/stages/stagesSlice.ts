import {
  createEntityAdapter,
  createSlice,
  EntityId,
  PayloadAction,
} from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import { Complex } from '../../../util/complex';
import { clearInputOutputValues } from '../../actions';
import { RootState } from '../../store';
import { solveActiveSheet } from '../ilwSolver/solveActiveSheet';
import { addSheet, removeSheet } from '../sheets/sheetsSlice';

const dataLayerDefaultScaleDownFactor = 0.8;

export type StageId = EntityId;

export interface StageLayer {
  intialized: boolean;
  scale: number;
  x: number;
  y: number;
}

export interface Stage {
  id: StageId;
  width: number;
  height: number;
  dataLayer: StageLayer;
}

const defaultStageProperties = {
  width: 0,
  height: 0,
  dataLayer: {
    intialized: false,
    scale: 0,
    x: 0,
    y: 0,
  },
};

export const initialStages: Stage[] = [
  {
    id: uuidv4(),
    ...defaultStageProperties,
  },
  {
    id: uuidv4(),
    ...defaultStageProperties,
  },
];

const stagesAdapter = createEntityAdapter<Stage>();

const emptyInitialState = stagesAdapter.getInitialState();
const filledInitialState = stagesAdapter.upsertMany(
  emptyInitialState,
  initialStages
);

export const stagesSlice = createSlice({
  name: 'stages',
  initialState: filledInitialState,
  reducers: {
    addStage: (
      state,
      action: PayloadAction<{
        id: StageId;
      }>
    ) => {
      const { id } = action.payload;
      stagesAdapter.addOne(state, {
        id,
        ...defaultStageProperties,
      });
    },
    removeStage: (
      state,
      action: PayloadAction<{
        id: StageId;
      }>
    ) => {
      const { id } = action.payload;
      stagesAdapter.removeOne(state, id);
    },
    resizeStage: (
      state,
      action: PayloadAction<{
        id: StageId;
        stageWidth: number;
        stageHeight: number;
      }>
    ) => {
      const { id, stageWidth, stageHeight } = action.payload;

      const stage = state.entities[id];
      if (!stage) throw new Error('Stage not found');

      stage.width = stageWidth;
      stage.height = stageHeight;

      if (!stage.dataLayer.intialized) {
        stagesSlice.caseReducers.centerEmptyStageDataLayer(
          state,
          stagesSlice.actions.centerEmptyStageDataLayer({ id })
        );
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
      const stage = state.entities[id];
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
      const stage = state.entities[id];
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
      const stage = state.entities[id];
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
      const stage = state.entities[id];
      if (!stage) throw new Error('Stage not found');

      const { dataLayer } = stage;

      if (typeof panX !== 'undefined') dataLayer.x += panX;
      if (typeof panY !== 'undefined') dataLayer.y += panY;
    },

    // TODO is this used?
    centerStageDataLayerOnValues: (
      state,
      action: PayloadAction<{
        id: StageId;
        values: Complex[];
      }>
    ) => {
      const { id, values } = action.payload;
      const stage = state.entities[id];
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
    },

    centerEmptyStageDataLayer: (
      state,
      action: PayloadAction<{
        id: StageId;
      }>
    ) => {
      const { id } = action.payload;
      const stage = state.entities[id];
      if (!stage) throw new Error('Stage not found');

      const stageMinSize = Math.min(stage.width, stage.height);
      const scale = (stageMinSize / 2) * dataLayerDefaultScaleDownFactor;
      const x = stage.width / 2;
      const y = stage.height / 2;

      stage.dataLayer.scale = scale;
      stage.dataLayer.x = x;
      stage.dataLayer.y = y;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(solveActiveSheet.fulfilled, (state, action) => {
      const { outputStageId, resultsByXSeed } = action.payload;

      const stage = state.entities[outputStageId];
      if (!stage) throw new Error('Stage not found');
      stagesSlice.caseReducers.centerStageDataLayerOnValues(
        state,
        stagesSlice.actions.centerStageDataLayerOnValues({
          id: outputStageId,
          values: resultsByXSeed.flatMap((xSeedResults) =>
            xSeedResults.results.flatMap((result) => result.values)
          ),
        })
      );
    });
    builder.addCase(clearInputOutputValues, (state, action) => {
      const { stageIds } = action.payload;
      stageIds.forEach((stageId) => {
        const stage = state.entities[stageId];
        if (!stage) throw new Error('Stage not found');
        stagesSlice.caseReducers.centerEmptyStageDataLayer(
          state,
          stagesSlice.actions.centerEmptyStageDataLayer({
            id: stageId,
          })
        );
      });
    });
    builder.addCase(addSheet, (state, action) => {
      const { inputStageId, outputStageId } = action.payload;
      stagesSlice.caseReducers.addStage(
        state,
        stagesSlice.actions.addStage({
          id: inputStageId,
        })
      );
      stagesSlice.caseReducers.addStage(
        state,
        stagesSlice.actions.addStage({
          id: outputStageId,
        })
      );
    });
    builder.addCase(removeSheet, (state, action) => {
      const { stageIds } = action.payload;
      stageIds.forEach((stageId) => {
        stagesSlice.caseReducers.removeStage(
          state,
          stagesSlice.actions.removeStage({
            id: stageId,
          })
        );
      });
    });
  },
});

// Selectors
export const selectStageById = (state: RootState, id: StageId) => {
  const stage = state.stages.entities[id];
  if (!stage) throw new Error('Stage not found');
  return stage;
};

const { actions, reducer } = stagesSlice;

export const {
  addStage,
  removeStage,
  resizeStage,
  updateStageDataLayerPosition,
  zoomStageDataLayerWithWheel,
  scaleStageDataLayer,
  panStageDataLayer,
  centerStageDataLayerOnValues,
  centerEmptyStageDataLayer,
} = actions;

export default reducer;
