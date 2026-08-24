import React, { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuthStore } from '../../stores/auth.store';

/**
 * Main application layout with top header and content area.
 */
const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header onLogout={handleLogout} />
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
