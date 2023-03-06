import { atom, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { useImmerAtom } from 'jotai-immer';

import { Complex, getRandomNumberBetween } from '../../util/complex';
import ComplexEditor from '../ComplexEditor';
import { css } from '@emotion/react';

function getRandomXSeedPartNumber(): number {
  return getRandomNumberBetween(-10, 10);
}

function getRandomXSeedNumber(): Complex {
  return [getRandomXSeedPartNumber(), getRandomXSeedPartNumber()];
}

export type XSeedValue = Complex[];

const xSeedValueFamily = atomFamily((_xSeedId: string) => {
  // TODO generate based on M (and maybe also validate?)
  const value = [getRandomXSeedNumber(), getRandomXSeedNumber()];
  return atom<XSeedValue>(value);
});

export const xSeedValueHasError = atom(false);

function XSeedValue({ xSeedId }: { xSeedId: string }) {
  const [xSeedValue, setXSeedValue] = useImmerAtom(xSeedValueFamily(xSeedId));
  const setXSeedValueHasError = useSetAtom(xSeedValueHasError);

  return (
    <div
      css={css`
        display: flex;
        gap: 10px;
      `}
    >
      {xSeedValue.map((c, cIndex) => (
        <ComplexEditor
          key={cIndex}
          value={c}
          onValidChange={(value) => {
            setXSeedValue((cDraft) => {
              cDraft[cIndex] = value;
            });
            setXSeedValueHasError(false);
          }}
          onError={() => {
            setXSeedValueHasError(true);
          }}
        />
      ))}
    </div>
  );
}

export default XSeedValue;
