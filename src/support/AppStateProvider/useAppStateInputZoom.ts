import { useContext } from 'react';

import { AppStateInputZoomProviderContext } from '.';

export default function useAppStateInputZoom() {
  const { inputZoom } = useContext(AppStateInputZoomProviderContext);
  return { appStateInputZoom: inputZoom };
}
