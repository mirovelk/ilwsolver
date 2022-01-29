import { Color, Matrix, Path, Point, Tool } from "paper";

const zoomStep = 0.8;
export function zoomOut(paper: paper.PaperScope) {
  paper.view.zoom *= zoomStep;
}
export function zoomIn(paper: paper.PaperScope) {
  paper.view.zoom /= zoomStep;
}

const scrollStep = 0.1;
export function scrollUp(paper: paper.PaperScope) {
  paper.view.translate(new Point(0, -scrollStep));
}
export function scrollDown(paper: paper.PaperScope) {
  paper.view.translate(new Point(0, scrollStep));
}
export function scrollLeft(paper: paper.PaperScope) {
  paper.view.translate(new Point(-scrollStep, 0));
}
export function scrollRight(paper: paper.PaperScope) {
  paper.view.translate(new Point(scrollStep, 0));
}

export function initCoordinates(paper: paper.PaperScope) {
  const shorterAxis = Math.min(
    paper.view.bounds.right,
    paper.view.bounds.bottom
  );
  const defaultScaleDownFactor = 0.9;
  paper.view.transform(
    new Matrix(
      (defaultScaleDownFactor * shorterAxis) / 2,
      0,
      0,
      (defaultScaleDownFactor * shorterAxis) / 2, // iverting breaks zoom and other utilities!
      paper.view.center.x,
      paper.view.center.y
    )
  );
}

export function initAxis() {
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

export function initPanning(
  paper: paper.PaperScope,
  wrapperRef: HTMLDivElement
) {
  wrapperRef.addEventListener("contextmenu", (e) => e.preventDefault());

  const tool = new Tool();

  tool.onMouseDown = function (e: paper.ToolEvent) {
    // @ts-ignore
    if (e.event.buttons === 2) {
      paper.view.element.style.cursor = "grab";
    }
  };

  tool.onMouseDrag = function (e: paper.ToolEvent) {
    // @ts-ignore
    if (e.event.buttons === 2) {
      paper.view.element.style.cursor = "grabbing";
      const delta = e.point.subtract(e.downPoint);
      paper.view.center = paper.view.center.subtract(delta);
    }
  };

  tool.onMouseUp = function (e: paper.ToolEvent) {
    paper.view.element.style.cursor = "crosshair";
  };
}

export function initZooming(
  paper: paper.PaperScope,
  wrapperRef: HTMLDivElement
) {
  wrapperRef.addEventListener("wheel", (e: WheelEvent) => {
    let newZoom = paper.view.zoom;
    let oldZoom = paper.view.zoom;

    if (e.deltaY > 0) {
      newZoom = paper.view.zoom * 1.05;
    } else {
      newZoom = paper.view.zoom * 0.95;
    }

    const beta = oldZoom / newZoom;

    const mousePosition = new paper.Point(e.offsetX, e.offsetY);

    const viewPosition = paper.view.viewToProject(mousePosition);

    const mouseProjectPosition = viewPosition;
    const center = paper.view.center;

    const pc = mouseProjectPosition.subtract(center);
    const offset = mouseProjectPosition
      .subtract(pc.multiply(beta))
      .subtract(center);

    paper.view.zoom = newZoom;
    paper.view.center = paper.view.center.add(offset);

    e.preventDefault();
  });
}

export function updateCursorCoordinatesStatus(
  e: paper.MouseEvent,
  statusCursorXValueRef: HTMLDivElement,
  statusCursorYValueRef: HTMLDivElement
) {
  statusCursorXValueRef.innerHTML = e.point.x.toString();
  statusCursorYValueRef.innerHTML = (-e.point.y).toString(); // render flipped
}
