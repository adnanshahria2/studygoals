import React from 'react';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { Dashboard } from '@/pages/Dashboard';
import { Toast } from '@/components/common/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen />
        <Toast />
      </>
    );
  }

  return (
    <DataProvider>
      <Dashboard />
      <Toast />
    </DataProvider>
  );
};
