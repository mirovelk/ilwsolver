import { useContext } from "react";

import { AppDispatchProviderContext } from ".";

export default function useAppDispatch() {
  const { dispatch } = useContext(AppDispatchProviderContext);
  return { appDispatch: dispatch };
}
