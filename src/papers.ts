import Paper from "paper";

export const inputPaper = new Paper.PaperScope();
export const outputPaper = new Paper.PaperScope();

inputPaper.settings.insertItems = false;
outputPaper.settings.insertItems = false;

export const drawingLayerName = "drawingLayer";
export const inputLayerName = "inputLayer";
export const outputLayerName = "ouputLayer";

export const inputStrokeWidth = 3;
export const ouputStrokeWidth = 3;

export const defaultScaleDownFactor = 0.9;

export function getDrawingLayer(): paper.Layer {
  return inputPaper.project.layers.find(
    (layer) => layer.name === drawingLayerName
  ) as paper.Layer; // assume it's always there
}

export function getInputLayer(): paper.Layer {
  return inputPaper.project.layers.find(
    (layer) => layer.name === inputLayerName
  ) as paper.Layer; // assume it's always there
}

export function getOuputLayer(): paper.Layer {
  return outputPaper.project.layers.find(
    (layer) => layer.name === outputLayerName
  ) as paper.Layer; // assume it's always there
}
