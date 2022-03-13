import { useContext } from 'react';

import { AppStateOutputProjectionVariantProviderContext } from '.';

export default function useAppStateOutputProjectionVariant() {
  const { outputProjectionVariant } = useContext(
    AppStateOutputProjectionVariantProviderContext
  );
  return { outputProjectionVariant };
}
