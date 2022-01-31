import React, { useEffect, useRef } from "react";
import Paper from "paper";

function Path({
  paper,
  points,
  segments,
  visible = true,
  strokeColor = new Paper.Color(1, 1, 1),
  strokeWidth = 1,
  selected = false,
  fullySelected = false,
}: {
  paper: paper.PaperScope;
  points?: paper.Point[];
  segments?: paper.Segment[];
  visible?: boolean;
  strokeColor?: paper.Color;
  strokeWidth?: number;
  selected?: boolean;
  fullySelected?: boolean;
}) {
  const pathRef = useRef<paper.Path>();

  // init
  useEffect(() => {
    pathRef.current = new Paper.Path();
    paper.project.activeLayer.addChild(pathRef.current);
  }, [paper]);

  // main updating function
  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.removeSegments(0, pathRef.current.segments.length);
      // preffer segments before points
      if (typeof segments !== "undefined") {
        pathRef.current.segments = segments;
      } else if (typeof points !== "undefined") {
        pathRef.current.segments = points.map(
          (point) => new Paper.Segment(point)
        );
      }
    }
  }, [points, segments, fullySelected, selected]);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.visible = visible;
    }
  }, [visible]);

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
