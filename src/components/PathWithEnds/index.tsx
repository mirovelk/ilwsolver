/** @jsxImportSource @emotion/react */
import Paper from 'paper';
import React, { useMemo } from 'react';

import Circle from '../paper/Circle';
import Path from '../paper/Path';
import Rectangle from '../paper/Rectangle';

function PathWithEnds({
  paper,
  zoom,
  points,
  segments,
  visible = true,
  strokeColor = new Paper.Color(1, 1, 1),
  strokeWidth = 1,
  selected = false,
  fullySelected = false,
  dashArray = [],
}: {
  paper: paper.PaperScope;
  zoom: number;
  points?: paper.Point[];
  segments?: paper.Segment[];
  visible?: boolean;
  strokeColor?: paper.Color;
  strokeWidth?: number;
  selected?: boolean;
  fullySelected?: boolean;
  dashArray?: number[];
}) {
  const startPointSegments =
    segments && segments.length > 0 && segments[0].point;
  const startPointPoints = points && points.length > 0 && points[0];
  const startPoint = startPointSegments || startPointPoints;
  const startPointSize = useMemo(() => (1 / zoom) * 10, [zoom]);

  const startPointRectangle = startPoint
    ? new paper.Rectangle({
        point: startPoint.subtract(startPointSize / 2),
        size: [startPointSize, startPointSize],
      })
    : undefined;

  const endPointSegments =
    segments && segments.length > 0 && segments[segments.length - 1].point;
  const endPointPoints =
    points && points.length > 0 && points[points.length - 1];
  const endPoint = endPointSegments || endPointPoints;

  const endPointRadius = useMemo(() => (1 / zoom) * 5, [zoom]);

  const endColor = useMemo(() => {
    const c = new Paper.Color(strokeColor);
    c.lightness -= 0.1;
    return c;
  }, [strokeColor]);

  return (
    <>
      <Path
        paper={paper}
        segments={segments}
        points={points}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        visible={visible}
        fullySelected={fullySelected}
        selected={selected}
        dashArray={dashArray}
      />
      {startPointRectangle && (
        <Rectangle
          paper={paper}
          rectangle={startPointRectangle}
          fillColor={endColor}
        />
      )}
      {endPoint && (
        <Circle
          paper={paper}
          center={endPoint}
          radius={endPointRadius}
          fillColor={endColor}
        />
      )}
    </>
  );
}

export default PathWithEnds;
