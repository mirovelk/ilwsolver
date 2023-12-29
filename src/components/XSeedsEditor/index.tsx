import styled from '@emotion/styled';
import { Add } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
import { useCallback } from 'react';
import { selectActiveSheetXSeedIds } from '../../redux/features/sheets/sheetsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { addXSeedToActiveSheet } from '../../redux/thunks/activeSheet/addXSeedToActiveSheet';

import MInput from './MInput';
import ResultsStartEndCopyButtons from './ResultsStartEndCopyButtons';
import XSeedRow from './XSeedRow';
import XSeedsTextarea from './XSeedsTextarea';

const Wrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

const XSeedsHeader = styled.div`
  display: flex;
  margin-bottom: 5px;
`;

const XSeedsHeaderControlsWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
`;
const HeaderRight = styled.div`
  display: flex;
`;

const CopyButtonsWrapper = styled.div``;

const AddXSeedButtonWrapper = styled.div``;

const XSeedsMWrapper = styled.div`
  display: flex;
  margin-right: 15px;
  align-items: baseline;
`;

const XSeedsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 10px;
`;

const AddXSeedButton = styled(IconButton)``;

const XSeedWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
`;

function XSeedsEditor() {
  const dispatch = useAppDispatch();
  const activeSheetXSeedIds = useAppSelector(selectActiveSheetXSeedIds);

  const addXSeedOnClick = useCallback(() => {
    dispatch(addXSeedToActiveSheet());
  }, [dispatch]);

  return (
    <Wrapper>
      <XSeedsHeader>
        <Typography
          variant="h6"
          color="text.secondary"
          gutterBottom
          style={{ marginRight: '20px' }}
        >
          xSeeds
        </Typography>

        <XSeedsHeaderControlsWrapper>
          <HeaderLeft>
            <CopyButtonsWrapper>
              <ResultsStartEndCopyButtons />
            </CopyButtonsWrapper>
          </HeaderLeft>
          <HeaderRight>
            <XSeedsMWrapper>
              <MInput />
            </XSeedsMWrapper>

            <AddXSeedButtonWrapper>
              <AddXSeedButton onClick={addXSeedOnClick}>
                <Add />
              </AddXSeedButton>
            </AddXSeedButtonWrapper>
          </HeaderRight>
        </XSeedsHeaderControlsWrapper>
      </XSeedsHeader>

      <XSeedsWrapper>
        {activeSheetXSeedIds.map((xSeedId) => (
          <XSeedWrapper key={xSeedId}>
            <XSeedRow xSeedId={xSeedId} />
          </XSeedWrapper>
        ))}
      </XSeedsWrapper>
      <XSeedsTextarea />
    </Wrapper>
  );
}

export default XSeedsEditor;
