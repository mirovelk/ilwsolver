import Paper, { Color, Matrix, Path, Point, Tool } from "paper";

let inputPath: paper.Path;

export function simplify() {
  if (inputPath) {
    inputPath.simplify(0.0001);
  }
}

const zoomStep = 0.8;
export function zoomOut() {
  Paper.view.zoom *= zoomStep;
}
export function zoomIn() {
  Paper.view.zoom /= zoomStep;
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

function flipY(point: paper.Point) {
  return new Point(point.x, -point.y);
}

function initCoordinates() {
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
      (defaultScaleDownFactor * shorterAxis) / 2, // iverting breaks zoom and other utilities!
      Paper.view.center.x,
      Paper.view.center.y
    )
  );
}

function initAxis() {
  const axisSqare = new Path.Rectangle(new Point(1, -1), new Point(-1, 1));
  axisSqare.strokeColor = new Color(0.15, 0.15, 0.15);

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

function initPanning(wrapperRef: HTMLDivElement) {
  wrapperRef.addEventListener("contextmenu", (e) => e.preventDefault());

  const tool = new Tool();

  tool.onMouseDown = function (e: paper.ToolEvent) {
    // @ts-ignore
    if (e.event.buttons === 2) {
      Paper.view.element.style.cursor = "grab";
    }
  };

  tool.onMouseDrag = function (e: paper.ToolEvent) {
    // @ts-ignore
    if (e.event.buttons === 2) {
      Paper.view.element.style.cursor = "grabbing";
      const delta = e.point.subtract(e.downPoint);
      Paper.view.center = Paper.view.center.subtract(delta);
    }
  };

  tool.onMouseUp = function (e: paper.ToolEvent) {
    Paper.view.element.style.cursor = "crosshair";
  };
}

function initZooming(wrapperRef: HTMLDivElement) {
  wrapperRef.addEventListener("wheel", (e: WheelEvent) => {
    let newZoom = Paper.view.zoom;
    let oldZoom = Paper.view.zoom;

    if (e.deltaY > 0) {
      newZoom = Paper.view.zoom * 1.05;
    } else {
      newZoom = Paper.view.zoom * 0.95;
    }

    const beta = oldZoom / newZoom;

    const mousePosition = new Paper.Point(e.offsetX, e.offsetY);

    const viewPosition = Paper.view.viewToProject(mousePosition);

    const mouseProjectPosition = viewPosition;
    const center = Paper.view.center;

    const pc = mouseProjectPosition.subtract(center);
    const offset = mouseProjectPosition
      .subtract(pc.multiply(beta))
      .subtract(center);

    Paper.view.zoom = newZoom;
    Paper.view.center = Paper.view.center.add(offset);

    e.preventDefault();
  });
}

const draw = (
  wrapperRef: HTMLDivElement,
  cursorInfoRef: HTMLDivElement,
  statusCursorRef: HTMLDivElement,
  statusCursorXValueRef: HTMLDivElement,
  statusCursorYValueRef: HTMLDivElement
) => {
  console.log("Calling draw!");

  Paper.project.currentStyle.strokeScaling = false;

  initCoordinates();
  initAxis();
  initPanning(wrapperRef);
  initZooming(wrapperRef);

  inputPath = new Paper.Path();
  inputPath.strokeColor = new Color(1, 0, 0);
  inputPath.strokeWidth = 3;

  function updateCursorCoordinatesStatus(e: paper.MouseEvent) {
    statusCursorXValueRef.innerHTML = e.point.x.toString();
    statusCursorYValueRef.innerHTML = (-e.point.y).toString(); // render flipped
  }

  Paper.view.onMouseDown = (e: paper.MouseEvent) => {
    // @ts-ignore
    if (e.event.buttons === 1) {
      inputPath.selected = false;
      inputPath.add(e.point);
    }
  };

  Paper.view.onMouseDrag = (e: paper.MouseEvent) => {
    // @ts-ignore
    if (e.event.buttons === 1) {
      inputPath.add(e.point);
      updateCursorCoordinatesStatus(e);
    }
  };

  Paper.view.onMouseUp = (e: paper.MouseEvent) => {
    inputPath.fullySelected = true;
  };

  Paper.view.onMouseEnter = (e: paper.MouseEvent) => {
    statusCursorRef.style.display = "inline-block";
    cursorInfoRef.style.display = "inline-block";
  };

  Paper.view.onMouseLeave = (e: paper.MouseEvent) => {
    statusCursorRef.style.display = "none";
    cursorInfoRef.style.display = "none";
  };

  Paper.view.onMouseMove = (e: paper.MouseEvent) => {
    updateCursorCoordinatesStatus(e);
  };

  Paper.view.onResize = () => {
    const wrapperWidth = wrapperRef.clientWidth;
    const wrapperHeight = wrapperRef.clientHeight;
    Paper.view.viewSize.width = wrapperWidth;
    Paper.view.viewSize.height = wrapperHeight;
  };
};

export default draw;
