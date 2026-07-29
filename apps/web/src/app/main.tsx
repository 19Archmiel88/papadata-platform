import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import {
  applyPapaDataRuntimeGlobals,
  getInitialPapaDataRuntimeGlobals,
} from '../design-system/foundations/runtime';
import { App } from './App';
import '../design-system/foundations/foundations.css';
import './app.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Nie znaleziono elementu #root.',
  );
}

const runtimeGlobals =
  getInitialPapaDataRuntimeGlobals();

applyPapaDataRuntimeGlobals(
  document.documentElement,
  runtimeGlobals,
);

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
