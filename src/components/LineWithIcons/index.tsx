import Konva from 'konva';
import { Group, Line } from 'react-konva';
import chroma from 'chroma-js';

interface LineWithIconsProps extends Konva.LineConfig {
  groupProps?: Konva.GroupConfig;
}

const iconSize = 10;

function getIconColor(color: string): string {
  return chroma(color).darken().hex();
}

function LineWithIcons({ groupProps, ...lineProps }: LineWithIconsProps) {
  return (
    <Group {...groupProps}>
      <Line {...lineProps} />
      {/* start point icon */}
      {lineProps.points && lineProps.points.length >= 2 && (
        <Line
          points={[lineProps.points[0], lineProps.points[1]]}
          stroke={getIconColor(lineProps.stroke as string)}
          strokeWidth={iconSize}
          strokeScaleEnabled={false}
          lineCap="square"
          closed
        />
      )}
      {/* end point icon */}
      {lineProps.points && lineProps.points.length >= 4 && (
        <Line
          points={[
            lineProps.points[lineProps.points.length - 2],
            lineProps.points[lineProps.points.length - 1],
          ]}
          stroke={getIconColor(lineProps.stroke as string)}
          strokeWidth={iconSize}
          strokeScaleEnabled={false}
          lineCap="round"
          closed
        />
      )}
    </Group>
  );
}

export default LineWithIcons;
