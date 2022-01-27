import Paper, { Color, Matrix, Path, Point } from "paper";

let inputPath: paper.Path;

export function simplify() {
  if (inputPath) {
    inputPath.simplify(0.0001);
  }
}

const zoomStep = 0.5;
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

function setupCoordinates() {
  const shorterAxis = Math.min(
    Paper.view.bounds.right,
    Paper.view.bounds.bottom
  );
  const defaultScaleDownFactor = 0.9;
  Paper.view.transform(
    new Matrix(
      (defaultScaleDownFactor * shorterAxis) / 2,
      0,
      0,
      (-defaultScaleDownFactor * shorterAxis) / 2,
      Paper.view.center.x,
      Paper.view.center.y
    )
  );
}

function setupAxis() {
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
}

const draw = (
  wrapperRef: HTMLDivElement,
  cursorInfoRef: HTMLDivElement,
  statusCursorRef: HTMLDivElement,
  statusCursorXValueRef: HTMLDivElement,
  statusCursorYValueRef: HTMLDivElement
) => {
  Paper.project.currentStyle.strokeScaling = false;

  setupCoordinates();
  setupAxis();

  inputPath = new Paper.Path();
  inputPath.strokeColor = new Color(1, 0, 0);
  inputPath.strokeWidth = 3;

  function updateCursorCoordinatesStatus(e: paper.MouseEvent) {
    statusCursorXValueRef.innerHTML = e.point.y.toString();
    statusCursorYValueRef.innerHTML = e.point.x.toString();
  }

  Paper.view.onMouseDown = (e: paper.MouseEvent) => {
    inputPath.selected = false;
    inputPath.add(e.point);
  };

  Paper.view.onMouseDrag = (e: paper.MouseEvent) => {
    inputPath.add(e.point);
    updateCursorCoordinatesStatus(e);
  };

  Paper.view.onMouseUp = (e: paper.MouseEvent) => {
    inputPath.fullySelected = true;
  };

  Paper.view.onMouseEnter = (e: paper.MouseEvent) => {
    wrapperRef.style.cursor = "crosshair";

    statusCursorXValueRef.innerHTML = e.point.x.toString();
    statusCursorYValueRef.innerHTML = e.point.y.toString();

    statusCursorRef.style.display = "inline-block";
    cursorInfoRef.style.display = "inline-block";
  };

  Paper.view.onMouseLeave = (e: paper.MouseEvent) => {
    wrapperRef.style.cursor = "default";
    statusCursorRef.style.display = "none";
    cursorInfoRef.style.display = "none";
  };

  Paper.view.onMouseMove = (e: paper.MouseEvent) => {
    updateCursorCoordinatesStatus(e);
  };

  Paper.view.onResize = () => {
    var wrapperWidth = wrapperRef.clientWidth;
    var wrapperHeight = wrapperRef.clientHeight;
    Paper.view.viewSize.width = wrapperWidth;
    Paper.view.viewSize.height = wrapperHeight;
  };
};

export default draw;
