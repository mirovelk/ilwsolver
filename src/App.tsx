import styled from '@emotion/styled';
import { Delete, PlayArrow } from '@mui/icons-material';
import { CircularProgress, IconButton } from '@mui/material';
import { useCallback } from 'react';

import InputArea from './components/InputArea';
import OutputArea from './components/OutputArea';
import {
  clearActiveSheetInputOutputValues,
  selectActiveSheetStageIds,
  selectActiveSheetQArray,
  selectActiveSheetQArrayValid,
  selectActiveSheetXSeedHasError,
  selectSolvingInprogress,
  solveActiveSheet,
} from './redux/features/app/appSlice';
import { useAppDispatch, useAppSelector } from './redux/store';
import StyleProvider from './support/style/StyleProvider';

const Wrapper = styled.div`
  position: relative;
  height: 100%;
`;

const AreasWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 20px;
  align-items: stretch;
`;

const AreaWrapper = styled.div`
  flex: 1 0 0;
  min-width: 0;

  &:not(:last-child) {
    margin-right: 20px;
  }
`;

const CenterControlsWrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 1000;
  top: 60px;
  left: 50%;
  transform: translate(-50%, 0);
`;

const RunButtonWrapper = styled.div`
  display: inline-flex;
`;

const ClearButtonWrapper = styled.div`
  margin-top: 5px;
`;

const StyledPlayArrow = styled(PlayArrow)`
  color: rgb(18 18 18);
  font-size: 1.3em;
`;

const RunButton = styled(IconButton)`
  background: rgb(102 187 106);
  border: 10px solid rgb(18 18 18);

  &:hover {
    background-color: rgb(56 142 60);
  }

  &:disabled {
    background-color: rgb(30 30 30);
  }
`;

const RunButtonGlyphWrapper = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClearButton = styled(IconButton)`
  background: rgb(18 18 18);
  border: 10px solid rgb(18 18 18);

  &:hover {
    background-color: rgb(244 67 54);
  }

  &:disabled {
    background-color: rgb(30 30 30);
  }
`;

const StyledDelete = styled(Delete)`
  color: white;
`;

function App() {
  const dispatch = useAppDispatch();
  const solvingInProgress = useAppSelector(selectSolvingInprogress);
  const activeSheetQArray = useAppSelector(selectActiveSheetQArray);
  const activeSheetQArrayValid = useAppSelector(selectActiveSheetQArrayValid);
  const activeSheetXSeedHasError = useAppSelector(
    selectActiveSheetXSeedHasError
  );
  const activeSheetStageIds = useAppSelector(selectActiveSheetStageIds);

  const process = useCallback(() => {
    if (!solvingInProgress) {
      dispatch(solveActiveSheet());
    }
  }, [dispatch, solvingInProgress]);

  const clear = useCallback(() => {
    dispatch(clearActiveSheetInputOutputValues());
  }, [dispatch]);

  return (
    <StyleProvider>
      <Wrapper>
        <CenterControlsWrapper>
          <RunButtonWrapper>
            <RunButton
              size="large"
              color="inherit"
              onClick={process}
              disabled={
                activeSheetXSeedHasError ||
                activeSheetQArray.length === 0 ||
                !activeSheetQArrayValid ||
                solvingInProgress
              }
            >
              <RunButtonGlyphWrapper>
                {solvingInProgress && <CircularProgress size={35} />}
                {!solvingInProgress && <StyledPlayArrow fontSize="inherit" />}
              </RunButtonGlyphWrapper>
            </RunButton>
          </RunButtonWrapper>
          <ClearButtonWrapper>
            <ClearButton onClick={clear}>
              <StyledDelete />
            </ClearButton>
          </ClearButtonWrapper>
        </CenterControlsWrapper>
        <AreasWrapper>
          <AreaWrapper>
            <InputArea inputStageId={activeSheetStageIds.inputStageId} />
          </AreaWrapper>
          <AreaWrapper>
            <OutputArea outputStageId={activeSheetStageIds.outputStageId} />
          </AreaWrapper>
        </AreasWrapper>
      </Wrapper>
    </StyleProvider>
  );
}

export default App;
