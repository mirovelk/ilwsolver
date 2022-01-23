import Paper, { Color } from "paper";

const draw = () => {
  let inputPath = new Paper.Path();

  Paper.view.onMouseDown = (_e: paper.MouseEvent) => {
    inputPath.strokeColor = new Color(1, 0, 0);
    inputPath.strokeWidth = 3;
  };

  Paper.view.onMouseDrag = (e: paper.MouseEvent) => {
    inputPath.add(e.point);
  };
};

export default draw;
