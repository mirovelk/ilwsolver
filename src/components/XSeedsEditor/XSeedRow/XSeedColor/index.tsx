import styled from '@emotion/styled';
import { useCallback } from 'react';
import { ChromePicker } from 'react-color';
import {
  selectVisibleColorPickerXSeedId,
  toggleColorPickerForXSeedId,
} from '../../../../redux/features/xSeedColorPicker/xSeedColorPickerSlice';
import {
  setXSeedColor,
  XSeedId,
  xSeedColorSelector,
} from '../../../../redux/features/xSeeds/xSeedsSlice';

import { useAppDispatch, useAppSelector } from '../../../../redux/store';

const Color = styled.div<{ seedColor: string }>`
  display: inline-block;
  height: 30px;
  width: 30px;
  border-radius: 4px;
  background: ${({ seedColor }) => seedColor};
  cursor: pointer;
`;

const ColorPickerWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 40px;
  margin-top: 15;
  z-index: 4000;
`;

function XSeedColor({ xSeedId }: { xSeedId: XSeedId }) {
  const dispatch = useAppDispatch();

  const xSeedColor = useAppSelector((state) =>
    xSeedColorSelector(state, xSeedId)
  );

  const visibleColorPickerXSeedId = useAppSelector(
    selectVisibleColorPickerXSeedId
  );

  const toggleColorPicker = useCallback(() => {
    dispatch(toggleColorPickerForXSeedId({ xSeedId }));
  }, [dispatch, xSeedId]);

  return (
    <>
      <Color seedColor={xSeedColor} onClick={toggleColorPicker} />
      <ColorPickerWrapper>
        {xSeedId === visibleColorPickerXSeedId && (
          <ChromePicker
            color={xSeedColor}
            disableAlpha
            styles={{
              default: {
                picker: {
                  background: '#111111',
                },
              },
            }}
            onChange={(color) => {
              dispatch(
                setXSeedColor({
                  xSeedId: xSeedId,
                  color: color.hex,
                })
              );
            }}
          />
        )}
      </ColorPickerWrapper>
    </>
  );
}

export default XSeedColor;
