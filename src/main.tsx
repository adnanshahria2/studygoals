import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

import { ReloadPrompt } from './components/ReloadPrompt';

console.log("🚀 Loaded StudyGoals Version: 1.2 (PWA Updates + Progress Bar Removed)");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
        <ReloadPrompt />
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
