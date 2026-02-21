import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');
  
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (e) {
  console.error('Failed to mount React app:', e);
  document.body.innerHTML = `<div style="color: red; padding: 20px;">Failed to load app: ${e instanceof Error ? e.message : String(e)}</div>`;
}
