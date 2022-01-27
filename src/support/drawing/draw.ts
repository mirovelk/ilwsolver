import Paper, { Color, Matrix, Path, Point } from 'paper';

let inputPath: paper.Path;

export function simplify() {
  if (inputPath) {
    inputPath.simplify(0.0001);
  }
}

const zoomStep = 0.1;

export function zoomOut() {
  Paper.view.scale(1 - zoomStep);
}
export function zoomIn() {
  Paper.view.scale(1 + zoomStep);
}

const scrollStep = 0.1;

export function scrollUp() {
  Paper.view.translate(new Point(0, -scrollStep));
}

export function scrollDown() {
  Paper.view.translate(new Point(0, scrollStep));
}

export function scrollLeft() {
  Paper.view.translate(new Point(-scrollStep, 0));
}

export function scrollRight() {
  Paper.view.translate(new Point(scrollStep, 0));
}

const draw = (
  wrapperRef: React.MutableRefObject<HTMLDivElement | null>,
  cursorInfoRef: React.MutableRefObject<HTMLDivElement | null>
) => {
  Paper.project.currentStyle.strokeScaling = false;

  const shorterAxis = Math.min(
    Paper.view.bounds.right,
    Paper.view.bounds.bottom
  );
  const defaultScaleDownFactor= 0.9;
  Paper.view.transform(
    new Matrix(
      defaultScaleDownFactor * shorterAxis / 2,
      0,
      0,
      -defaultScaleDownFactor * shorterAxis / 2,
      Paper.view.center.x,
      Paper.view.center.y
    )
  );

  //Paper.view.scale(0.9);

  const axisCircle = new Path.Circle(new Point(0, 0), 1);
  axisCircle.strokeColor = new Color(0.2, 0.2, 0.2);

  const xAxis = new Path.Line(
    new Point(-99999999999, 0),
    new Point(99999999999, 0)
  );
  const yAxis = new Path.Line(
    new Point(0, -99999999999),
    new Point(0, 99999999999)
  );
  const axisColor = new Color(0.6, 0.6, 0.6);
  xAxis.strokeColor = axisColor;
  yAxis.strokeColor = axisColor;

  inputPath = new Paper.Path();
  inputPath.strokeColor = new Color(1, 0, 0);
  inputPath.strokeWidth = 3;

  function updateCursorCoordinatesLabel(e: paper.MouseEvent) {
    if (cursorInfoRef.current) {
      const projectCoordinates = Paper.view.projectToView(e.point);

      cursorInfoRef.current.innerHTML = `${e.point.x}, ${e.point.y}`;
      cursorInfoRef.current.style.top = `${projectCoordinates.y - 35}px`;
      cursorInfoRef.current.style.left = `${projectCoordinates.x + 10}px`;
    }
  }

  Paper.view.onMouseDown = (e: paper.MouseEvent) => {
    inputPath.selected = false;
    inputPath.add(e.point);
  };

  Paper.view.onMouseDrag = (e: paper.MouseEvent) => {
    inputPath.add(e.point);
    updateCursorCoordinatesLabel(e);
  };

  Paper.view.onMouseUp = (e: paper.MouseEvent) => {
    inputPath.fullySelected = true;
  };

  Paper.view.onMouseEnter = (e: paper.MouseEvent) => {
    if (wrapperRef.current) {
      wrapperRef.current.style.cursor = "crosshair";
    }
    if (cursorInfoRef.current) {
      cursorInfoRef.current.style.display = "inline-block";
    }
  };

  Paper.view.onMouseLeave = (e: paper.MouseEvent) => {
    if (wrapperRef.current) {
      wrapperRef.current.style.cursor = "default";
    }
    if (cursorInfoRef.current) {
      cursorInfoRef.current.style.display = "none";
    }
  };

  Paper.view.onMouseMove = (e: paper.MouseEvent) => {
    updateCursorCoordinatesLabel(e);
  };

  Paper.view.onResize = () => {
    if (wrapperRef.current) {
      var wrapperWidth = wrapperRef.current.clientWidth;
      var wrapperHeight = wrapperRef.current.clientHeight;
      Paper.view.viewSize.width = wrapperWidth;
      Paper.view.viewSize.height = wrapperHeight;
    }
  };
};

export default draw;
