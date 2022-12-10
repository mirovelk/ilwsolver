import styled from '@emotion/styled';
import {
  Divider,
  Paper as MaterialPaper,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback } from 'react';

import {
  selectCalcConfig,
  selectN,
  setCalcConfigAxArrayCPart,
  setCalcConfigAxN,
  setCalcConfigExCPart,
} from '../../redux/features/app/appSlice';
import { Ax, Ex } from '../../support/calc/calc';
import { useAppDispatch, useAppSelector } from '../../redux/store';

const Wrapper = styled(MaterialPaper)`
  display: inline-flex;
  flex-direction: column;
  padding: 10px 20px;
`;

const Header = styled.div`
  display: flex;
  margin-bottom: 5px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;

  &:not(:last-child) {
    margin-bottom: 5px;
  }
`;

const NEditor = styled.div`
  display: flex;
  margin: 10px 0;
`;

const ExEditors = styled.div`
  white-space: nowrap;
  margin-bottom: 10px;
`;

const AxEditors = styled.div`
  white-space: nowrap;
`;

const AxEditor = styled.div`
  display: flex;
`;

const ComplexEditor = styled(MaterialPaper)`
  display: flex;

  &:not(:last-child) {
    margin-right: 5px;
  }
`;

const ComplexPartEditor = styled.div`
  padding: 5px;
  width: 100px;

  &:not(:last-child) {
    margin-right: 5px;
  }
`;

const AxWrapper = styled.div``;

const NInput = styled(TextField)`
  width: 40px;
  margin-left: 5px;
`;

const ExKeysOrdered: Array<keyof Ex> = ['E1', 'E2', 'E3'];
const AxKeysOrdered: Array<keyof Ax> = ['AL', 'AR'];

function CalcConfigEditor() {
  const dispatch = useAppDispatch();

  const calcConfig = useAppSelector(selectCalcConfig);
  const N = useAppSelector(selectN);

  const onExInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.currentTarget.value);
      const ExValue = e.currentTarget.dataset.ex as keyof Ex;
      const cPartIndex = Number(e.currentTarget.dataset.cPartIndex);

      dispatch(
        setCalcConfigExCPart({ cPartValue: value, cPartIndex, Ex: ExValue })
      );
    },
    [dispatch]
  );

  const onNInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const N = Number(e.currentTarget.value);
      dispatch(setCalcConfigAxN({ N }));
    },
    [dispatch]
  );

  const onAxInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.currentTarget.value);
      const AxValue = e.currentTarget.dataset.ax as keyof Ax;
      const axCIndex = Number(e.currentTarget.dataset.axCIndex);
      const cPartIndex = Number(e.currentTarget.dataset.cPartIndex);

      dispatch(
        setCalcConfigAxArrayCPart({
          cPartValue: value,
          cPartIndex,
          Ax: AxValue,
          axCIndex: axCIndex,
        })
      );
    },
    [dispatch]
  );

  return (
    <Wrapper elevation={3}>
      <Header>
        <Typography
          variant="h6"
          color="text.secondary"
          gutterBottom
          style={{ marginRight: '20px' }}
        >
          Config
        </Typography>
      </Header>

      <ExEditors>
        {ExKeysOrdered.map((ExKey) => (
          <Row key={ExKey}>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              style={{ marginRight: '10px' }}
            >
              {ExKey} =
            </Typography>
            <ComplexEditor elevation={0}>
              {calcConfig.Ex[ExKey].map((cPart, cPartIndex) => (
                <ComplexPartEditor key={cPartIndex}>
                  <TextField
                    value={cPart}
                    variant="standard"
                    type="number"
                    inputProps={{
                      step: 0.1,
                      'data-ex': ExKey,
                      'data-c-part-index': cPartIndex,
                    }}
                    onChange={onExInputChange}
                  />
                </ComplexPartEditor>
              ))}
            </ComplexEditor>
          </Row>
        ))}
      </ExEditors>
      <Divider variant="fullWidth" />
      <AxWrapper>
        <NEditor>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            N =
          </Typography>
          <NInput
            value={N}
            variant="standard"
            type="number"
            onChange={onNInputChange}
          />
        </NEditor>
        <AxEditors>
          {AxKeysOrdered.map((AxKey) => (
            <Row key={AxKey}>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                style={{ marginRight: '10px' }}
              >
                {AxKey} =
              </Typography>
              <AxEditor>
                {calcConfig.Ax[AxKey].map((axC, axCIndex) => (
                  <ComplexEditor elevation={0} key={axCIndex}>
                    {axC.map((cPart, cPartIndex) => (
                      <ComplexPartEditor key={cPartIndex}>
                        <TextField
                          value={cPart}
                          variant="standard"
                          type="number"
                          inputProps={{
                            step: 0.1,
                            'data-ax': AxKey,
                            'data-ax-c-index': axCIndex,
                            'data-c-part-index': cPartIndex,
                          }}
                          onChange={onAxInputChange}
                        />
                      </ComplexPartEditor>
                    ))}
                  </ComplexEditor>
                ))}
              </AxEditor>
            </Row>
          ))}
        </AxEditors>
      </AxWrapper>
    </Wrapper>
  );
}

export default CalcConfigEditor;
