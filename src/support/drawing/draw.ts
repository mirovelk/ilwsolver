import Paper, { Color, Point } from 'paper';

export function zoomOut() {
  Paper.view.scale(0.9);
}

export function zoomIn() {
  Paper.view.scale(1.1);
}

export function scrollUp() {
  Paper.view.translate(new Point(0, -20));
}

export function scrollDown() {
  Paper.view.translate(new Point(0, 20));
}

export function scrollLeft() {
  Paper.view.translate(new Point(-20, 0));
}

export function scrollRight() {
  Paper.view.translate(new Point(20, 0));
}

const draw = (wrapperRef: React.MutableRefObject<HTMLDivElement | null>) => {
  const inputPath = new Paper.Path();

  Paper.view.onMouseDown = (_e: paper.MouseEvent) => {
    inputPath.strokeColor = new Color(1, 0, 0);
    inputPath.strokeWidth = 3;
  };

  Paper.view.onMouseDrag = (e: paper.MouseEvent) => {
    inputPath.add(e.point);
  };

  Paper.view.onResize = () => {
    if (wrapperRef.current) {
      var wrapperWidth = wrapperRef.current.clientWidth;
      var wrapperHeight = wrapperRef.current.clientHeight;
      Paper.view.viewSize.width = wrapperWidth;
      Paper.view.viewSize.height = wrapperHeight;
      // const center = new Point(wrapperWidth / 2, wrapperHeight / 2);
      // Paper.view.center = center;
    }
  };
};

export default draw;
