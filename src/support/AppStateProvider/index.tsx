import React, { Dispatch, useMemo } from 'react';
import { useReducer } from 'react';

import { Complex } from '../../util/complex';
import { AppAction, appReducer, initialAppState, OutputProjectionVariant, Sheet, Solvers } from './reducer';

export const AppDispatchProviderContext = React.createContext<{
  dispatch: Dispatch<AppAction>;
}>({
  dispatch: () => null,
});

export const AppStateSolversProviderContext = React.createContext<{
  solvers: Solvers;
}>({
  solvers: initialAppState.sheets[0].solvers,
});

export const AppStateInputValuesContext = React.createContext<{
  inputValues: Complex[];
}>({
  inputValues: initialAppState.sheets[0].inputValues,
});

export const AppStateInputSimplifyContext = React.createContext<{
  inputSimplifyTolerance: number;
  inputSimplifyEnabled: boolean;
}>({
  inputSimplifyTolerance: initialAppState.sheets[0].inputSimplifyTolerance,
  inputSimplifyEnabled: initialAppState.sheets[0].inputSimplifyEnabled,
});

export const AppStateBadPointsProviderContext = React.createContext<{
  badPoints: Complex[];
}>({
  badPoints: initialAppState.badPoints,
});

export const AppStateInputZoomProviderContext = React.createContext<{
  inputZoom: number;
}>({
  inputZoom: initialAppState.inputZoom,
});

export const AppStateOutputZoomProviderContext = React.createContext<{
  outputZoom: number;
}>({
  outputZoom: initialAppState.outputZoom,
});

export const AppStateOutputProjectionVariantProviderContext =
  React.createContext<{
    outputProjectionVariant: OutputProjectionVariant;
  }>({
    outputProjectionVariant: initialAppState.outputProjectionVariant,
  });

export const AppStateSheetsProviderContext = React.createContext<{
  sheets: Sheet[];
  activeSheetIndex: number;
  secondaryActiveSheetIndecies: Set<number>;
}>({
  sheets: initialAppState.sheets,
  activeSheetIndex: initialAppState.activeSheetIndex,
  secondaryActiveSheetIndecies: initialAppState.secondaryActiveSheetIndecies,
});

export const AppStateInputSegmentsProviderContext = React.createContext<{
  inputSegments: paper.Segment[];
}>({
  inputSegments: initialAppState.sheets[0].inputSegments,
});

export const AppStateInputDrawingPointsProviderContext = React.createContext<{
  inputDrawingPoints: paper.Point[];
}>({
  inputDrawingPoints: initialAppState.sheets[0].inputDrawingPoints,
});

export const AppStatePreviousSheetEndPointProviderContext =
  React.createContext<{
    previousSheetEndPoint?: paper.Point;
  }>({
    previousSheetEndPoint: undefined,
  });

function AppStateProvider({ children }: { children: React.ReactElement }) {
  const [appState, appDispatch] = useReducer(appReducer, initialAppState);

  const activeSheet = useMemo(
    () => appState.sheets[appState.activeSheetIndex],
    [appState.activeSheetIndex, appState.sheets]
  );

  const previousSheet = useMemo(
    () => appState.sheets[appState.activeSheetIndex - 1],
    [appState.activeSheetIndex, appState.sheets]
  );

  return (
    <AppDispatchProviderContext.Provider
      value={useMemo(() => ({ dispatch: appDispatch }), [appDispatch])}
    >
      <AppStateSheetsProviderContext.Provider
        value={useMemo(
          () => ({
            sheets: appState.sheets,
            activeSheetIndex: appState.activeSheetIndex,
            secondaryActiveSheetIndecies: appState.secondaryActiveSheetIndecies,
          }),
          [
            appState.activeSheetIndex,
            appState.secondaryActiveSheetIndecies,
            appState.sheets,
          ]
        )}
      >
        <AppStateSolversProviderContext.Provider
          value={useMemo(
            () => ({
              solvers: activeSheet.solvers,
            }),
            [activeSheet.solvers]
          )}
        >
          <AppStateInputValuesContext.Provider
            value={useMemo(
              () => ({
                inputValues: activeSheet.inputValues,
              }),
              [activeSheet.inputValues]
            )}
          >
            <AppStateBadPointsProviderContext.Provider
              value={useMemo(
                () => ({
                  badPoints: appState.badPoints,
                }),
                [appState.badPoints]
              )}
            >
              <AppStateInputZoomProviderContext.Provider
                value={useMemo(
                  () => ({
                    inputZoom: appState.inputZoom,
                  }),
                  [appState.inputZoom]
                )}
              >
                <AppStateOutputZoomProviderContext.Provider
                  value={useMemo(
                    () => ({
                      outputZoom: appState.outputZoom,
                    }),
                    [appState.outputZoom]
                  )}
                >
                  <AppStateInputSegmentsProviderContext.Provider
                    value={useMemo(
                      () => ({
                        inputSegments: activeSheet.inputSegments,
                      }),
                      [activeSheet.inputSegments]
                    )}
                  >
                    <AppStateInputDrawingPointsProviderContext.Provider
                      value={useMemo(
                        () => ({
                          inputDrawingPoints: activeSheet.inputDrawingPoints,
                        }),
                        [activeSheet.inputDrawingPoints]
                      )}
                    >
                      <AppStateInputSimplifyContext.Provider
                        value={useMemo(
                          () => ({
                            inputSimplifyTolerance:
                              activeSheet.inputSimplifyTolerance,
                            inputSimplifyEnabled:
                              activeSheet.inputSimplifyEnabled,
                          }),
                          [
                            activeSheet.inputSimplifyTolerance,
                            activeSheet.inputSimplifyEnabled,
                          ]
                        )}
                      >
                        <AppStatePreviousSheetEndPointProviderContext.Provider
                          value={useMemo(
                            () => ({
                              previousSheetEndPoint:
                                (previousSheet &&
                                  previousSheet.inputSegments &&
                                  previousSheet.inputSegments[
                                    previousSheet.inputSegments.length - 1
                                  ] &&
                                  previousSheet.inputSegments[
                                    previousSheet.inputSegments.length - 1
                                  ].point) ||
                                undefined,
                            }),
                            [previousSheet]
                          )}
                        >
                          <AppStateOutputProjectionVariantProviderContext.Provider
                            value={useMemo(
                              () => ({
                                outputProjectionVariant:
                                  appState.outputProjectionVariant,
                              }),
                              [appState.outputProjectionVariant]
                            )}
                          >
                            {children}
                          </AppStateOutputProjectionVariantProviderContext.Provider>
                        </AppStatePreviousSheetEndPointProviderContext.Provider>
                      </AppStateInputSimplifyContext.Provider>
                    </AppStateInputDrawingPointsProviderContext.Provider>
                  </AppStateInputSegmentsProviderContext.Provider>
                </AppStateOutputZoomProviderContext.Provider>
              </AppStateInputZoomProviderContext.Provider>
            </AppStateBadPointsProviderContext.Provider>
          </AppStateInputValuesContext.Provider>
        </AppStateSolversProviderContext.Provider>
      </AppStateSheetsProviderContext.Provider>
    </AppDispatchProviderContext.Provider>
  );
}

export default AppStateProvider;
