import Paper from 'paper';
import { useEffect, useRef } from 'react';

function Path({
  paper,
  points,
  segments,
  visible = true,
  strokeColor = new Paper.Color(1, 1, 1),
  strokeWidth = 1,
  selected = false,
  fullySelected = false,
  dashArray = [],
  onClick,
}: {
  paper: paper.PaperScope;
  points?: paper.Point[];
  segments?: paper.Segment[];
  visible?: boolean;
  strokeColor?: paper.Color;
  strokeWidth?: number;
  selected?: boolean;
  fullySelected?: boolean;
  dashArray?: number[];
  onClick?: (event: paper.MouseEvent) => void;
}) {
  const pathRef = useRef<paper.Path>();

  // init
  useEffect(() => {
    pathRef.current = new Paper.Path();
    paper.project.activeLayer.addChild(pathRef.current);

    return () => {
      if (pathRef.current) pathRef.current.remove();
    };
  }, [paper]);

  // main updating function
  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.removeSegments(0, pathRef.current.segments.length);
      // preffer segments before points
      if (typeof segments !== 'undefined') {
        pathRef.current.segments = segments;
      } else if (typeof points !== 'undefined') {
        pathRef.current.segments = points.map(
          (point) => new Paper.Segment(point)
        );
      }
      if (fullySelected) pathRef.current.fullySelected = true;
    }
  }, [points, segments, fullySelected, selected]);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.onClick = (event: paper.MouseEvent) => {
        if (onClick) onClick(event);
      };
    }
  }, [onClick]);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.visible = visible;
    }
  }, [visible]);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.dashArray = dashArray;
    }
  }, [dashArray]);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.strokeColor = strokeColor;
    }
  }, [strokeColor]);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.strokeWidth = strokeWidth;
    }
  }, [strokeWidth]);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.fullySelected = fullySelected;
    }
  }, [fullySelected]);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.selected = selected;
    }
  }, [selected]);

  return null;
}

export default Path;
