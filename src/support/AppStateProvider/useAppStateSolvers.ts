import { useContext } from "react";

import { AppStateSolversProviderContext } from ".";

export default function useAppStateSolvers() {
  const { solvers } = useContext(AppStateSolversProviderContext);
  return { appStateSolvers: solvers };
}
