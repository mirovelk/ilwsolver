import { useContext } from 'react';

import { AppStateInputSegmentsProviderContext } from '.';

export default function useAppStateInputSegments() {
  const { inputSegments } = useContext(AppStateInputSegmentsProviderContext);
  return { inputSegments };
}
