import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@xyflow/react/dist/base.css';
import './styles.css';
import ELK from 'elkjs/lib/elk-api';
import elkWorkerUrl from 'elkjs/lib/elk-worker.min.js?url';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setElkFactory } from './engine/layout';
import { App } from './ui/App';

// ELK runs in a web worker so layouts never block the UI
setElkFactory(async () => new ELK({ workerFactory: () => new Worker(elkWorkerUrl) }));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
