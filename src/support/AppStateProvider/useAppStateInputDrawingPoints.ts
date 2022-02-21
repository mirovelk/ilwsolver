import { useContext } from 'react';

import { AppStateInputDrawingPointsProviderContext } from '.';

export default function useAppStateInputDrawingPoints() {
  const { inputDrawingPoints } = useContext(
    AppStateInputDrawingPointsProviderContext
  );
  return { inputDrawingPoints };
}
