import Paper from 'paper';
import { useEffect, useRef } from 'react';

function Path({
  paper,
  center,
  radius,
  fillColor = new Paper.Color(255, 255, 0),
  strokeColor,
  strokeWidth = 1,
  onClick,
}: {
  paper: paper.PaperScope;
  center: paper.Point;
  radius: number;
  fillColor?: paper.Color;
  strokeColor?: paper.Color;
  strokeWidth?: number;
  onClick?: (event: paper.MouseEvent) => void;
}) {
  const pathRef = useRef<paper.Path>();

  // init
  useEffect(() => {
    pathRef.current = new Paper.Path.Circle(center, radius);
    if (fillColor) pathRef.current.fillColor = fillColor;
    if (strokeColor) pathRef.current.strokeColor = strokeColor;
    pathRef.current.strokeWidth = strokeWidth;
    paper.project.activeLayer.addChild(pathRef.current);

    return () => {
      if (pathRef.current) pathRef.current.remove();
    };
  }, [paper, center, radius, fillColor, strokeColor, strokeWidth]);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.onClick = (event: paper.MouseEvent) => {
        if (onClick) onClick(event);
      };
    }
  }, [onClick]);

  return null;
}

export default Path;
