import { useContext } from "react";

import { AppStateInputValuesContext } from ".";

export default function useAppStateInputValues() {
  const { inputValues } = useContext(AppStateInputValuesContext);
  return { appStateInputValues: inputValues };
}
