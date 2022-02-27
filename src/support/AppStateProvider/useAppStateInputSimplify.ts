import { useContext } from 'react';

import { AppStateInputSimplifyContext } from '.';

export default function useAppStateInputSimplifyTolerance() {
  const { inputSimplifyTolerance, inputSimplifyEnabled } = useContext(
    AppStateInputSimplifyContext
  );
  return { inputSimplifyTolerance, inputSimplifyEnabled };
}
