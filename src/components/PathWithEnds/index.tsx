/** @jsxImportSource @emotion/react */
import Paper from 'paper';
import React, { useMemo } from 'react';

import Circle from '../paper/Circle';
import Path from '../paper/Path';
import Star from '../paper/Star';

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
  const startPointRadius1 = useMemo(() => (1 / zoom) * 7, [zoom]);

  const startPointRadius2 = useMemo(() => (1 / zoom) * 4, [zoom]);

  const endPointRadius = useMemo(() => (1 / zoom) * 5, [zoom]);

  return (
    <>
      {segments && segments.length > 0 && (
        <Star
          paper={paper}
          center={segments[0].point}
          radius1={startPointRadius1}
          radius2={startPointRadius2}
          fillColor={strokeColor}
        />
      )}
      {segments && segments.length > 0 && (
        <Circle
          paper={paper}
          center={segments[segments.length - 1].point}
          radius={endPointRadius}
          fillColor={strokeColor}
        />
      )}
      {points && points.length > 0 && (
        <Star
          paper={paper}
          center={points[0]}
          radius1={startPointRadius1}
          radius2={startPointRadius2}
          fillColor={strokeColor}
        />
      )}
      {points && points.length > 0 && (
        <Circle
          paper={paper}
          center={points[points.length - 1]}
          radius={endPointRadius}
          fillColor={strokeColor}
        />
      )}
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
    </>
  );
}

export default PathWithEnds;
