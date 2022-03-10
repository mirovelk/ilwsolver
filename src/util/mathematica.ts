export function stringifyForMathematica(input: object) {
  return JSON.stringify(input).replaceAll("[", "{").replaceAll("]", "}");
}
