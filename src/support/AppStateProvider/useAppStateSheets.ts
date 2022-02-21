import { useContext } from 'react';

import { AppStateSheetsProviderContext } from '.';

export default function useAppStateSheets() {
  const { sheets, activeSheetIndex, secondaryActiveSheetIndecies } = useContext(
    AppStateSheetsProviderContext
  );
  return { sheets, activeSheetIndex, secondaryActiveSheetIndecies };
}
