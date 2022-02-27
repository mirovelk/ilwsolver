import { useContext } from 'react';

import { AppStatePreviousSheetEndPointProviderContext } from '.';

export default function useAppStatePreviousSheetEndPoint() {
  const { previousSheetEndPoint } = useContext(
    AppStatePreviousSheetEndPointProviderContext
  );
  return {
    previousSheetEndPoint,
  };
}
