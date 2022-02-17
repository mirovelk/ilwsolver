import { useContext } from 'react';

import { AppStateBadPointsProviderContext } from '.';

export default function useAppStateBadPoints() {
  const { badPoints } = useContext(AppStateBadPointsProviderContext);
  return { appStateBadPoints: badPoints };
}
