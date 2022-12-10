import Paper from 'paper';
import { useEffect, useRef } from 'react';

function Rectangle({
  paper,
  rectangle,
  fillColor = new Paper.Color(255, 255, 0),
  strokeColor,
  strokeWidth = 1,
  onClick,
}: {
  paper: paper.PaperScope;
  rectangle: paper.Rectangle;
  fillColor?: paper.Color;
  strokeColor?: paper.Color;
  strokeWidth?: number;
  onClick?: (event: paper.MouseEvent) => void;
}) {
  const pathRef = useRef<paper.Path>();

  // init
  useEffect(() => {
    pathRef.current = new Paper.Path.Rectangle(rectangle);
    if (fillColor) pathRef.current.fillColor = fillColor;
    if (strokeColor) pathRef.current.strokeColor = strokeColor;
    pathRef.current.strokeWidth = strokeWidth;
    paper.project.activeLayer.addChild(pathRef.current);

    return () => {
      if (pathRef.current) pathRef.current.remove();
    };
  }, [paper, rectangle, fillColor, strokeColor, strokeWidth]);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.onClick = (event: paper.MouseEvent) => {
        if (onClick) onClick(event);
      };
    }
  }, [onClick]);

  return null;
}

export default Rectangle;
