import styled from '@emotion/styled';
import { Paper as MaterialPaper, TextField } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import {
  Complex,
  areComplexEqual,
  parseComplex,
  stringifyComplex,
} from '../../util/complex';

const ComplexWrapper = styled(MaterialPaper)`
  display: flex;
  padding: 5px;
`;

const ComplexInput = styled(TextField)``;

function ComplexEditor({
  value,
  onValidChange,
  onError,
}: {
  value: Complex;
  onValidChange: (value: Complex) => void;
  onError?: () => void;
}) {
  const [inputValue, setInputValue] = useState(stringifyComplex(value));
  const [inputValueValid, setInputValueValid] = useState(true);

  // update value from props
  useEffect(() => {
    try {
      const parsedValue = parseComplex(inputValue);
      // but only if not equal to current input value to avoid cursor jumping
      if (!areComplexEqual(parsedValue, value))
        setInputValue(stringifyComplex(value));
    } catch {
      // do nothing
    }
  }, [inputValue, value]);

  // handle input change
  const inputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.currentTarget.value;
      setInputValue(inputValue);
      try {
        const parsedValue = parseComplex(inputValue);
        setInputValueValid(true);
        onValidChange(parsedValue);
      } catch {
        setInputValueValid(false);
        onError && onError();
      }
    },
    [onValidChange, onError]
  );

  // format after edit
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

export default ComplexEditor;
