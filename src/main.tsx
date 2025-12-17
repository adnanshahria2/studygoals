import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

import { DataProvider } from '@/contexts/DataContext';
import { ReloadPrompt } from './components/ReloadPrompt';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

console.log(`%c 🚀 Loaded StudyGoals Version: 1.3 \n%c Contact: adnanshahria2019@gmail.com `,
  'background: linear-gradient(to right, #6366f1, #a855f7, #ec4899); color: white; padding: 10px; border-radius: 10px; font-weight: bold; margin-top: 20px;',
  'color: #9ca3af; margin-top: 5px; font-style: italic;');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <ErrorBoundary>
            <App />
            <ReloadPrompt />
          </ErrorBoundary>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
