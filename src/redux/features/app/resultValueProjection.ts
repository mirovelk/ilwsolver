import {
  add,
  complex,
  Complex,
  divide,
  multiply,
  subtract,
} from '../../../util/complex';
import { OutputProjectionVariant } from './types';

function projectValueV2(x: Complex, q: Complex): Complex {
  return add(x, divide(complex(6), subtract(complex(1), q)));
}

function projectValueV3(x: Complex, q: Complex): Complex {
  return multiply(subtract(complex(1), q), x);
}

export function valueToProjectedValue(
  x: Complex,
  q: Complex,
  projectionVariant: OutputProjectionVariant
): Complex {
  switch (projectionVariant) {
    case OutputProjectionVariant.V1:
      return x;
    case OutputProjectionVariant.V2:
      return projectValueV2(x, q);
    case OutputProjectionVariant.V3:
      return projectValueV3(x, q);
    default:
      return x;
  }
}
