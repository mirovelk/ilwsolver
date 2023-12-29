import styled from '@emotion/styled';
import { Ballot } from '@mui/icons-material';
import { Checkbox, FormControlLabel, Grid, Input, Slider } from '@mui/material';
import React, { useCallback, useEffect } from 'react';

import { selectActiveSheetInputSimplifyConfig } from '../../../redux/features/sheets/sheetsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { updateActiveSheetQArray } from '../../../redux/thunks/activeSheet/updateActiveSheetQArray';
import { setActiveSheetInputSimplifyEnabled } from '../../../redux/thunks/activeSheet/setActiveSheetInputSimplifyEnabled';
import { setActiveSheetInputSimplifyTolerance } from '../../../redux/thunks/activeSheet/setActiveSheetInputSimplifyTolerance';

import QValues from '../../QValues';
import XSeedsEditor from '../../XSeedsEditor';
import PopupPanel from '../../PopupPanel';
import { Panel } from '../../../redux/features/uiPanels/uiPanelsSlice';

const ControlsWrapper = styled(Grid)`
  height: 30px;
`;

const SIMPLIFY_MIN = -5;
const SIMPLIFY_MAX = 5;
const SIMPLIFY_STEP = 0.01;

function InputBottomControls() {
  const dispatch = useAppDispatch();

  const { enabled: inputSimplifyEnabled, tolerance: inputSimplifyTolerance } =
    useAppSelector(selectActiveSheetInputSimplifyConfig);

  const handleSimplifySliderChange = useCallback(
    (_e: Event, newValue: number | number[]) => {
      if (typeof newValue === 'number') {
        dispatch(setActiveSheetInputSimplifyTolerance(newValue));
      }
    },
    [dispatch]
  );

  const handleSimplifyInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        setActiveSheetInputSimplifyTolerance(
          e.target.value === '' ? SIMPLIFY_MIN : Number(e.target.value)
        )
      );
    },
    [dispatch]
  );

  const handleSimplifyInputBlur = useCallback(() => {
    if (inputSimplifyTolerance < SIMPLIFY_MIN) {
      dispatch(setActiveSheetInputSimplifyTolerance(SIMPLIFY_MIN));
    } else if (inputSimplifyTolerance > SIMPLIFY_MAX) {
      dispatch(setActiveSheetInputSimplifyTolerance(SIMPLIFY_MAX));
    }
  }, [dispatch, inputSimplifyTolerance]);

  // update qArray on siplify config change
  useEffect(() => {
    dispatch(updateActiveSheetQArray());
  }, [dispatch, inputSimplifyEnabled, inputSimplifyTolerance]);

  return (
    <ControlsWrapper container spacing={2} alignItems="center">
      <Grid item>
        <PopupPanel
          panel={Panel.XSeedsPanel}
          icon={<Ballot />}
          placement="left"
        >
          <XSeedsEditor />
        </PopupPanel>
      </Grid>
      <Grid item>
        <PopupPanel panel={Panel.QPanel} icon="q" placement="left">
          <QValues />
        </PopupPanel>
      </Grid>
      <Grid item>
        <FormControlLabel
          label="Simplify"
          control={
            <Checkbox
              checked={inputSimplifyEnabled}
              onChange={() =>
                dispatch(
                  setActiveSheetInputSimplifyEnabled(!inputSimplifyEnabled)
                )
              }
            />
          }
        />
      </Grid>
      <Grid item xs>
        <Slider
          value={
            typeof inputSimplifyTolerance === 'number'
              ? inputSimplifyTolerance
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
          value={inputSimplifyTolerance}
          size="small"
          onChange={handleSimplifyInputChange}
          onBlur={handleSimplifyInputBlur}
          inputProps={{
            step: SIMPLIFY_STEP,
            min: SIMPLIFY_MIN,
            max: SIMPLIFY_MAX,
            type: 'number',
          }}
        />
      </Grid>
    </ControlsWrapper>
  );
}

export default InputBottomControls;
