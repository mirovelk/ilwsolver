import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createRoot } from 'react-dom/client';
import { Provider as StoreProvider } from 'react-redux';

import App from './App';
import store from './redux/store';

const container = document.getElementById('root');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

// TODO re-enable strict mode
root.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>
);
