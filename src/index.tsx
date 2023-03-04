import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React from 'react';

import { createRoot } from 'react-dom/client';
import { Provider as StoreProvider } from 'react-redux';
import { RecoilRoot } from 'recoil';

import App from './App';
import store from './redux/store';

const container = document.getElementById('root');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <StoreProvider store={store}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </StoreProvider>
  </React.StrictMode>
);
