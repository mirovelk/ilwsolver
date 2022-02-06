import React, { useCallback, useEffect, useState } from "react";
import Paper, { Color } from "paper";
import produce from "immer";

import InteractiveCanvas from "../InteractiveCanvas";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  Input,
  Slider,
  TextField,
  Paper as MaterialPaper,
  IconButton,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import { inputStrokeWidth } from "../../papers";
import { complex, Complex, getRandomComplexNumber } from "../../util/complex";
import Path from "../paper/Path";
import { Add, Remove, Settings } from "@mui/icons-material";

const DrawingPath = styled(Path)``;
const InputPath = styled(Path)``;

const ControlsWrapper = styled(Grid)`
  height: 30px;
`;

const LeftControlsWrapper = styled(MaterialPaper)`
  display: inline-flex;
  flex-direction: column;
  position: absolute;
  z-index: 2000;
  top: 80px;
  left: 40px;
  padding: 10px 20px;
`;

const XSeedsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const XSeedsMWrapper = styled.div`
  display: flex;
  align-items: baseline;
`;

const XSeedsMInput = styled(TextField)`
  width: 40px;
  margin-left: 5px;
`;

const XSeedInput = styled(TextField)``;

const XSeedsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 10px;
`;

const XSeed = styled(MaterialPaper)`
  display: flex;
  padding: 5px;
  &:not(:last-child) {
    margin-bottom: 10px;
  }
`;

const XSeedRoot = styled(MaterialPaper)`
  display: flex;
  padding: 5px;
  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const XSeedRootPart = styled(MaterialPaper)`
  padding: 5px;
  width: 70px;
  &:not(:last-child) {
    margin-right: 5px;
  }
`;

const XSeedRootPartInput = styled(TextField)``;

const AddXSeedButtonWrapper = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
`;

const AddXSeedButton = styled(IconButton)``;

const XSeedWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const XSeedRemoveWrapper = styled.div`
  margin-right: 10px;
`;

const drawingPathIsDrawingColor = new Color(1, 0, 0);
const drawingPathIsNotDrawingColor = new Color(0.3, 0.3, 0.3);
const drawingPathIsNotDrawingWidth = 1;

const inputPathColor = new Color(1, 0, 0);

const SIMPLIFY_INITIAL = 0.003;
const SIMPLIFY_MIN = 0.0001;
const SIMPLIFY_MAX = 0.01;
const SIMPLIFY_STEP = 0.0001;

function getInputFromPath(
  inputPath: paper.Path,
  inputSteps: number
): Complex[] {
  const inputPoints: paper.Point[] = [];
  const step = inputPath.length / inputSteps;
  for (let i = 0; i < inputPath.length; i += step) {
    // can cause +-1 points due to float addition
    inputPoints.push(inputPath.getPointAt(i));
  }
  return inputPoints.map((point) => complex(point.x, -point.y)); // flip y
}

function parseXSeeds(input: string): XSeeds {
  return JSON.parse(input.replaceAll("{", "[").replaceAll("}", "]"));
}

function stringifyXSeeds(xSeeds: XSeeds) {
  let output = "";
  output += "{";
  xSeeds.forEach((xSeed, xSeedIndex) => {
    output += "{";
    output += "\n";
    xSeed.forEach((c, cIndex) => {
      output += "  {";
      output += c[0];
      output += ", ";
      output += c[1];
      output += " }";
      if (cIndex < xSeed.length - 1) output += ",";
    });
    output += "\n";
    output += "}";
    if (xSeedIndex < xSeeds.length - 1) output += ",";
  });
  output += "}";

  return output;
}

function getRandomXSeedNumber(): Complex {
  return getRandomComplexNumber(-10, 10);
}

export type XSeeds = Complex[][];

function InputArea({
  paper,
  setInput,
  inputSteps,
  xSeeds,
  setXSeeds,
  clearInputAreaPathsRef,
}: {
  paper: paper.PaperScope;
  setInput: (input: Complex[]) => void;
  inputSteps: number;
  xSeeds: XSeeds;
  setXSeeds: React.Dispatch<React.SetStateAction<XSeeds>>;
  clearInputAreaPathsRef: React.MutableRefObject<(() => void) | undefined>;
}) {
  const [xSeedsInput, setXSeedsInput] = useState(stringifyXSeeds(xSeeds));
  const [xSeedsInputError, setXSeedsInputError] = useState(false);
  const [xSeedsM, setXSeedsM] = useState(xSeeds[0].length);
  const [xSeedsEditorVisible, setXSeedsEditorVisible] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);

  const [simplifyEnabled, setSimplifyEnabled] = useState(true);

  const [simplifyTolerance, setSimplifyTolerance] =
    useState<number>(SIMPLIFY_INITIAL);

  const [drawingPathPoints, setDrawingPathPoints] = useState<paper.Point[]>([]);

  const [inputPathSegmnets, setInputPathSegments] = useState<paper.Segment[]>(
    []
  );

  const clearInputAreaPaths = useCallback(() => {
    setDrawingPathPoints([]);
    setInputPathSegments([]);
  }, []);

  // pass clear paths fn
  useEffect(() => {
    clearInputAreaPathsRef.current = clearInputAreaPaths;
  }, [clearInputAreaPathsRef, clearInputAreaPaths]);

  const handleSimplifySliderChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      if (typeof newValue === "number") setSimplifyTolerance(newValue);
    },
    []
  );

  const handleSimplifyInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSimplifyTolerance(
        event.target.value === "" ? SIMPLIFY_MIN : Number(event.target.value)
      );
    },
    []
  );

  const handleSimplifyInputBlur = useCallback(() => {
    if (simplifyTolerance < SIMPLIFY_MIN) {
      setSimplifyTolerance(SIMPLIFY_MIN);
    } else if (simplifyTolerance > SIMPLIFY_MAX) {
      setSimplifyTolerance(SIMPLIFY_MAX);
    }
  }, [simplifyTolerance]);

  // inpit paper events
  useEffect(() => {
    const oldOnMouseDown = paper.view.onMouseDown;
    paper.view.onMouseDown = (e: paper.MouseEvent) => {
      if (oldOnMouseDown) oldOnMouseDown(e);
      // @ts-ignore
      if (e.event.buttons === 1) {
        setIsDrawing(true);
        setDrawingPathPoints((previousDrawingPath) => [
          ...previousDrawingPath,
          e.point,
        ]);
      }
    };

    const oldOnMouseDrag = paper.view.onMouseDrag;
    paper.view.onMouseDrag = (e: paper.MouseEvent) => {
      if (oldOnMouseDrag) oldOnMouseDrag(e);
      // @ts-ignore
      if (e.event.buttons === 1) {
        setDrawingPathPoints((previousDrawingPath) => [
          ...previousDrawingPath,
          e.point,
        ]);
      }
    };

    const oldOnMouseUp = paper.view.onMouseUp;
    paper.view.onMouseUp = (e: paper.MouseEvent) => {
      if (oldOnMouseUp) oldOnMouseUp(e);
      setIsDrawing(false);
    };
  }, [paper]);

  // calculate input path on drawing path or other parameter change (after finishing drawing)
  useEffect(() => {
    if (!isDrawing) {
      const path = new Paper.Path(drawingPathPoints);
      if (simplifyEnabled) {
        path.simplify(simplifyTolerance);
      }
      setInputPathSegments(path.segments);
      setInput(getInputFromPath(path, inputSteps));
    }
  }, [
    drawingPathPoints,
    isDrawing,
    simplifyEnabled,
    simplifyTolerance,
    inputSteps,
    setInput,
  ]);

  // process xSeeds input
  useEffect(() => {
    try {
      const xSeedsParsed = parseXSeeds(xSeedsInput);

      if (
        Array.isArray(xSeedsParsed) &&
        xSeedsParsed.length > 0 && // at least one xSeed
        xSeedsParsed.every(
          (xSeed) =>
            Array.isArray(xSeed) &&
            xSeed.length > 0 && // at least one point in xSeed
            xSeed.length === xSeedsParsed[0].length && // all xSeeds same length
            xSeed.every(
              (c) =>
                c.length === 2 &&
                typeof c[0] === "number" &&
                typeof c[1] === "number"
            )
        )
      ) {
        setXSeedsInputError(false);
        setXSeeds((previousXSeeds) =>
          JSON.stringify(xSeedsParsed) !== JSON.stringify(previousXSeeds)
            ? xSeedsParsed
            : previousXSeeds
        );
      } else {
        throw new Error("invalid input");
      }
    } catch {
      setXSeedsInputError(true);
    }
  }, [setXSeeds, xSeedsInput]);

  // reflect xSeeds changes back into editing area
  useEffect(() => {
    setXSeedsInput(stringifyXSeeds(xSeeds));
  }, [xSeeds]);

  const setXSeedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setXSeedsInput(e.currentTarget.value);
    },
    []
  );

  const xSeedsMInputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newM = parseInt(e.currentTarget.value);
      if (typeof newM === "number" && !isNaN(newM) && newM > 0) {
        setXSeedsM(newM);
        setXSeeds((previousXSeeds: XSeeds) => {
          // assuming there's always at least one xSeed
          if (previousXSeeds[0].length < newM) {
            return previousXSeeds.map((xSeed) => [
              ...xSeed,
              getRandomXSeedNumber(),
            ]);
          } else if (previousXSeeds[0].length > newM) {
            return previousXSeeds.map((xSeed) =>
              xSeed.slice(0, xSeed.length - 1)
            );
          }
          return previousXSeeds;
        });
      }
    },
    [setXSeeds]
  );

  const addXSeedOnClick = useCallback(() => {
    setXSeeds((previousXSeeds: XSeeds) => {
      // assuming there's always at least one xSeed
      const M = xSeeds[0].length;
      return [
        ...previousXSeeds,
        new Array(M).fill(null).map(() => getRandomXSeedNumber()),
      ];
    });
  }, [setXSeeds, xSeeds]);

  const removeXSeedWithIndex = useCallback(
    (index: number) => {
      setXSeeds((previousXSeeds: XSeeds) => {
        return previousXSeeds.length > 1
          ? previousXSeeds.filter((_, itemIndex) => itemIndex !== index)
          : previousXSeeds;
      });
    },
    [setXSeeds]
  );

  const xSeedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const xSeedIndex = parseInt(e.target.dataset.xSeedIndex as string);
      const cIndex = parseInt(e.target.dataset.cIndex as string);
      const cPartIndex = parseInt(e.target.dataset.cPartIndex as string);

      const value = parseFloat(e.currentTarget.value);

      if (typeof value === "number" && !isNaN(value)) {
        setXSeeds((previousXSeeds) => {
          const nextXSeeds = produce(previousXSeeds, (draft) => {
            draft[xSeedIndex][cIndex][cPartIndex] = value;
          });
          return nextXSeeds;
        });
      }
    },
    [setXSeeds]
  );

  const toggleXSeedsEditor = useCallback(() => {
    setXSeedsEditorVisible(
      (previousXSeedsEditorVisible) => !previousXSeedsEditorVisible
    );
  }, []);

  return (
    <>
      {xSeedsEditorVisible && (
        <LeftControlsWrapper elevation={3}>
          <XSeedsHeader>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              xSeeds
            </Typography>

            <XSeedsMWrapper>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                M=
              </Typography>
              <XSeedsMInput
                value={xSeedsM}
                variant="standard"
                type="number"
                onChange={xSeedsMInputOnChange}
              />
            </XSeedsMWrapper>
          </XSeedsHeader>

          <XSeedsWrapper>
            {xSeeds.map((xSeed, xSeedIndex) => (
              <XSeedWrapper key={xSeedIndex}>
                <XSeedRemoveWrapper>
                  <IconButton
                    size="small"
                    onClick={() => removeXSeedWithIndex(xSeedIndex)}
                  >
                    <Remove fontSize="inherit" />
                  </IconButton>
                </XSeedRemoveWrapper>

                <XSeed elevation={0} key={xSeedIndex}>
                  {xSeed.map((c, cIndex) => (
                    <XSeedRoot elevation={3} key={cIndex}>
                      {c.map((cPart, cPartIndex) => (
                        <XSeedRootPart elevation={0} key={cPartIndex}>
                          <XSeedRootPartInput
                            value={cPart}
                            variant="standard"
                            type="number"
                            inputProps={{
                              step: 0.1,
                              "data-x-seed-index": xSeedIndex,
                              "data-c-index": cIndex,
                              "data-c-part-index": cPartIndex,
                            }}
                            onChange={xSeedOnChange}
                          />
                        </XSeedRootPart>
                      ))}
                    </XSeedRoot>
                  ))}
                </XSeed>
              </XSeedWrapper>
            ))}
            <AddXSeedButtonWrapper>
              <AddXSeedButton onClick={addXSeedOnClick}>
                <Add />
              </AddXSeedButton>
            </AddXSeedButtonWrapper>
          </XSeedsWrapper>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Edit:
          </Typography>
          <XSeedInput
            value={xSeedsInput}
            error={xSeedsInputError}
            onChange={setXSeedOnChange}
            multiline
            helperText={xSeedsInputError ? "Invalid input" : ""}
          />
        </LeftControlsWrapper>
      )}
      <InteractiveCanvas
        paper={paper}
        id="input"
        title="Input"
        controls={
          <ControlsWrapper container spacing={2} alignItems="center">
            <Grid item>
              <IconButton onClick={toggleXSeedsEditor}>
                <Settings />
              </IconButton>
            </Grid>
            <Grid item>
              <FormControlLabel
                label="Simplify"
                control={
                  <Checkbox
                    checked={simplifyEnabled}
                    onChange={() => setSimplifyEnabled((previous) => !previous)}
                  />
                }
              />
            </Grid>
            <Grid item xs>
              <Slider
                value={
                  typeof simplifyTolerance === "number"
                    ? simplifyTolerance
                    : SIMPLIFY_MIN
                }
                size="small"
                step={SIMPLIFY_STEP}
                min={SIMPLIFY_MIN}
                max={SIMPLIFY_MAX}
                onChange={handleSimplifySliderChange}
              />
            </Grid>
            <Grid item>
              <Input
                value={simplifyTolerance}
                size="small"
                onChange={handleSimplifyInputChange}
                onBlur={handleSimplifyInputBlur}
                inputProps={{
                  step: SIMPLIFY_STEP,
                  min: SIMPLIFY_MIN,
                  max: SIMPLIFY_MAX,
                  type: "number",
                }}
              />
            </Grid>
          </ControlsWrapper>
        }
      />
      <DrawingPath
        paper={paper}
        points={drawingPathPoints}
        strokeColor={
          isDrawing ? drawingPathIsDrawingColor : drawingPathIsNotDrawingColor
        }
        strokeWidth={
          isDrawing ? inputStrokeWidth : drawingPathIsNotDrawingWidth
        }
      />
      <InputPath
        paper={paper}
        segments={inputPathSegmnets}
        strokeColor={inputPathColor}
        strokeWidth={inputStrokeWidth}
        visible={!isDrawing}
        fullySelected={!isDrawing}
      />
    </>
  );
}

export default InputArea;
