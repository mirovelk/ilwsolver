import Paper from 'paper';
import { useEffect, useRef } from 'react';

function Star({
  paper,
  center,
  points = 7,
  radius1,
  radius2,
  fillColor = new Paper.Color(255, 255, 0),
  strokeColor,
  strokeWidth = 1,
}: {
  paper: paper.PaperScope;
  center: paper.Point;
  points?: number;
  radius1: number;
  radius2: number;
  fillColor?: paper.Color;
  strokeColor?: paper.Color;
  strokeWidth?: number;
}) {
  const pathRef = useRef<paper.Path>();

  // init
  useEffect(() => {
    pathRef.current = new Paper.Path.Star(center, points, radius1, radius2);
    if (fillColor) pathRef.current.fillColor = fillColor;
    if (strokeColor) pathRef.current.strokeColor = strokeColor;
    pathRef.current.strokeWidth = strokeWidth;
    paper.project.activeLayer.addChild(pathRef.current);

    return () => {
      if (pathRef.current) pathRef.current.remove();
    };
  }, [
    paper,
    center,
    fillColor,
    strokeColor,
    strokeWidth,
    points,
    radius1,
    radius2,
  ]);

  return null;
}

export default Star;
