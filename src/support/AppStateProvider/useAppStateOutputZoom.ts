import { useContext } from 'react';

import { AppStateOutputZoomProviderContext } from '.';

export default function useAppStateOutputZoom() {
  const { outputZoom } = useContext(AppStateOutputZoomProviderContext);
  return { appStateOutputZoom: outputZoom };
}
