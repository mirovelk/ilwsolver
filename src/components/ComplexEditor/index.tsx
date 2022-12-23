import styled from '@emotion/styled';
import { Paper as MaterialPaper, TextField } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { Complex, parseComplex, stringifyComplex } from '../../util/complex';

const ComplexWrapper = styled(MaterialPaper)`
  display: flex;
  padding: 5px;
`;

const ComplexInput = styled(TextField)``;

function ComplexEditor({
  value,
  onEditFinished,
  showError,
  hideError,
}: {
  value: Complex;
  onEditFinished: (value: Complex) => void;
  showError?: () => void;
  hideError?: () => void;
}) {
  const [inputValue, setInputValue] = useState(stringifyComplex(value));
  const [inputValueValid, setInputValueValid] = useState(true);

  // update from props if there's a change
  useEffect(() => {
    try {
      const parsedValue = parseComplex(inputValue);
      if (parsedValue[0] !== value[0] || parsedValue[1] !== value[1])
        setInputValue(stringifyComplex(value));
    } catch {
      // do nothing
    }
  }, [inputValue, value]);

  const inputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.currentTarget.value;
      setInputValue(inputValue);
      try {
        const parsedValue = parseComplex(inputValue);
        setInputValueValid(true);
        hideError && hideError();
        if (parsedValue[0] !== value[0] || parsedValue[1] !== value[1])
          onEditFinished(parsedValue);
      } catch {
        setInputValueValid(false);
        showError && showError();
      }
    },
    [hideError, onEditFinished, showError, value]
  );

  // for formatting after edit
  const inputOnBlur = useCallback(
    (_e: React.FocusEvent<HTMLInputElement>) => {
      try {
        setInputValue(stringifyComplex(value));
      } catch {
        // do nothing
      }
    },
    [value]
  );

  return (
    <ComplexWrapper elevation={0}>
      <ComplexInput
        value={inputValue}
        variant="standard"
        onChange={inputOnChange}
        onBlur={inputOnBlur}
        error={!inputValueValid}
      />
    </ComplexWrapper>
  );
}

export default React.memo(ComplexEditor);
