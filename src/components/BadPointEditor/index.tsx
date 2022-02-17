/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { Paper as MaterialPaper, TextField, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { setBadPointsAction } from '../../support/AppStateProvider/reducer';
import useAppDispatch from '../../support/AppStateProvider/useAppDispatch';
import useAppStateBadPoints from '../../support/AppStateProvider/useAppStateBadPoints';
import { Complex } from '../../util/complex';

const Wrapper = styled(MaterialPaper)`
  display: inline-flex;
  flex-direction: column;
  padding: 10px 20px;
`;

const XSeedsHeader = styled.div`
  display: flex;
  margin-bottom: 5px;
`;

const BadPointsInput = styled(TextField)`
  min-width: 400px;
`;

function parseBadPoints(input: string): Complex[] {
  return JSON.parse(input.replaceAll("{", "[").replaceAll("}", "]"));
}

function stringifyBadPoints(points: Complex[]) {
  let output = "";
  output += "{";
  output += "\n";
  points.forEach((point, pointIndex) => {
    output += "    { ";
    output += point[0];
    output += ", ";
    output += point[1];
    output += " }";
    if (pointIndex < points.length - 1) output += ", ";
    output += "\n";
  });
  output += "}";

  return output;
}

function BadPointEditor() {
  const { appDispatch } = useAppDispatch();
  const { appStateBadPoints } = useAppStateBadPoints();

  const [badPointsInput, setBadPointsInput] = useState(
    stringifyBadPoints(appStateBadPoints)
  );
  const [badPointsInputError, setBadPointsInputError] = useState(false);

  const badPointsInputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setBadPointsInput(value);

      try {
        const badPointsParsed = parseBadPoints(value);
        if (
          Array.isArray(badPointsParsed) &&
          badPointsParsed.every(
            (badPoint) =>
              Array.isArray(badPoint) &&
              badPoint.length === 2 &&
              typeof badPoint[0] === "number" &&
              typeof badPoint[1] === "number"
          )
        ) {
          setBadPointsInputError(false);
          appDispatch(setBadPointsAction(badPointsParsed));
        } else {
          throw new Error("invalid input");
        }
      } catch {
        setBadPointsInputError(true);
      }
    },
    [appDispatch]
  );

  return (
    <Wrapper elevation={3}>
      <XSeedsHeader>
        <Typography
          variant="h6"
          color="text.secondary"
          gutterBottom
          style={{ marginRight: "20px" }}
        >
          Points
        </Typography>
      </XSeedsHeader>

      <BadPointsInput
        value={badPointsInput}
        error={badPointsInputError}
        onChange={badPointsInputOnChange}
        multiline
        helperText={badPointsInputError ? "Invalid input" : ""}
      />
    </Wrapper>
  );
}

export default React.memo(BadPointEditor);
