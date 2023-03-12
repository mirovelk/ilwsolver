import { XSeedValue } from '../features/xSeeds/xSeedsSlice';
import { AppThunk } from '../store';

// setXSeedsValues: (state, action: PayloadAction<XSeedValue[]>) => {
//     // optimized to not re-render if the values are the same and the ouput is valid
//     const activeSheet = state.sheets.entities[state.activeSheetId];
//     if (!activeSheet) throw new Error('Sheet not found');

//     const payloadXSeedsValues = action.payload;
//     const xSeedIds = activeSheet.xSeedIds;

//     // update (or remove) existing xSeeds
//     xSeedIds.forEach((xSeedId, xSeedIdIndex) => {
//       if (xSeedIdIndex < payloadXSeedsValues.length) {
//         const xSeed = state.xSeeds.entities[xSeedId];
//         if (!xSeed) throw new Error('xSeed not found');
//         const newXSeed = payloadXSeedsValues[xSeedIdIndex];
//         xSeedsAdapter.updateOne(state.xSeeds, {
//           id: xSeedId,
//           changes: {
//             value: newXSeed,
//             resultsValid: false,
//           },
//         });
//       } else {
//         // if there's more xSeeds than xSeed values in payload, remove the extra xSeeds
//         xSeedsAdapter.removeOne(state.xSeeds, xSeedId);
//         sheetsAdapter.updateOne(state.sheets, {
//           id: state.activeSheetId,
//           changes: {
//             xSeedIds: activeSheet.xSeedIds.filter((id) => id !== xSeedId),
//           },
//         });
//       }
//     });

//     // add new xSeeds if there's more xSeed values in payload than xSeeds
//     const newXSeedValues = payloadXSeedsValues.slice(xSeedIds.length);
//     if (newXSeedValues.length > 0) {
//       // fill the colors buffer with the colors of the existing xSeeds
//       const colorsBuffer = xSeedIds.map((xSeedId) => {
//         const color = state.xSeeds.entities[xSeedId]?.color;
//         if (!color) throw new Error('xSeed not found');
//         return color;
//       });

//       const newXSeeds: XSeed[] = newXSeedValues.map((newXSeedValue) => ({
//         id: uuidv4(),
//         value: newXSeedValue,
//         results: [],
//         resultsValid: false,
//         color: getNextColorWithBuffer(colorsBuffer),
//       }));

//       xSeedsAdapter.addMany(state.xSeeds, newXSeeds);

//       sheetsAdapter.updateOne(state.sheets, {
//         id: state.activeSheetId,
//         changes: {
//           xSeedIds: [...xSeedIds, ...newXSeeds.map((xSeed) => xSeed.id)],
//         },
//       });
//     }
//   },

export const setXSeedsValues =
  (xSeedValues: XSeedValue[]): AppThunk =>
  (_dispatch, _getState) => {
    console.log('TODO :>> ', xSeedValues);
  };
