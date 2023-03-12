import styled from '@emotion/styled';
import {
  Divider,
  Paper as MaterialPaper,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback } from 'react';

import { Ax, Ex } from '../../core/solve';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import ComplexEditor from '../ComplexEditor';
import { Complex } from '../../util/complex';
import {
  selectN,
  selectSolverConfig,
  setSolverConfigAxArrayC,
  setSolverConfigAxN,
  setSolverConfigExC,
} from '../../redux/features/solverConfig/solverConfigSlice';

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

const ComplexEditorWrapper = styled(MaterialPaper)`
  display: flex;

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

function SolveConfigEditor() {
  const dispatch = useAppDispatch();

  const solveConfig = useAppSelector(selectSolverConfig);
  const N = useAppSelector(selectN);

  const onExEditFinished = useCallback(
    (exKey: keyof Ex, value: Complex) => {
      dispatch(setSolverConfigExC({ cValue: value, Ex: exKey }));
    },
    [dispatch]
  );

  const onNInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const N = Number(e.currentTarget.value);
      dispatch(setSolverConfigAxN({ N }));
    },
    [dispatch]
  );

  const onAxEditFinished = useCallback(
    (axKey: keyof Ax, axCIndex: number, value: Complex) => {
      dispatch(setSolverConfigAxArrayC({ cValue: value, axCIndex, Ax: axKey }));
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
            <ComplexEditorWrapper elevation={0}>
              <ComplexEditor
                value={solveConfig.Ex[ExKey]}
                onValidChange={(value) => {
                  onExEditFinished(ExKey, value);
                }}
              />
            </ComplexEditorWrapper>
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
                {solveConfig.Ax[AxKey].map((axC, axCIndex) => (
                  <ComplexEditorWrapper elevation={0} key={axCIndex}>
                    <ComplexEditor
                      key={axCIndex}
                      value={axC}
                      onValidChange={(value) => {
                        onAxEditFinished(AxKey, axCIndex, value);
                      }}
                    />
                  </ComplexEditorWrapper>
                ))}
              </AxEditor>
            </Row>
          ))}
        </AxEditors>
      </AxWrapper>
    </Wrapper>
  );
}

export default SolveConfigEditor;
