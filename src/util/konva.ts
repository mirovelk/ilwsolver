import { Complex, complex } from './complex';
import Konva from 'konva';

export function pointPositionToLayerCoordintes(
  point: Konva.Vector2d,
  layer: Konva.Node
): Konva.Vector2d {
  const layerTransform = layer.getTransform().copy().invert();
  return layerTransform.point(point);
}

export const konvaLinePointsToComplexArray = (
  linePoints: number[]
): Complex[] => {
  const result: Complex[] = [];
  const linePointsCopy = [...linePoints];
  while (linePointsCopy.length) {
    const point = linePointsCopy.splice(0, 2);
    result.push(complex(point[0], point[1]));
  }
  return result;
};
