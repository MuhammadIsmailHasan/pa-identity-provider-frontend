import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from './config/routes';

import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthGuard from './components/guards/AuthGuard';
import AdminGuard from './components/guards/AdminGuard';
import GuestGuard from './components/guards/GuestGuard';

// Lazy load pages
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const OAuthAuthorizePage = lazy(() => import('./pages/auth/OAuthAuthorizePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const AppListPage = lazy(() => import('./pages/AppListPage'));
const EmployeeListPage = lazy(() => import('./pages/admin/employees/EmployeeListPage'));
const EmployeeDetailPage = lazy(() => import('./pages/admin/employees/EmployeeDetailPage'));
const JabatanPage = lazy(() => import('./pages/admin/JabatanPage'));
const ClientListPage = lazy(() => import('./pages/admin/clients/ClientListPage'));
const ClientDetailPage = lazy(() => import('./pages/admin/clients/ClientDetailPage'));
const RoleMappingPage = lazy(() => import('./pages/admin/RoleMappingPage'));

function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  // Auth routes (guest only)
  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <LazyWrapper><LoginPage /></LazyWrapper> },
        ],
      },
    ],
  },

  // OAuth authorize (accessible without auth)
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.OAUTH_AUTHORIZE, element: <LazyWrapper><OAuthAuthorizePage /></LazyWrapper> },
    ],
  },

  // Protected routes
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <LazyWrapper><DashboardPage /></LazyWrapper> },
          { path: ROUTES.PROFILE, element: <LazyWrapper><ProfilePage /></LazyWrapper> },
          { path: ROUTES.CHANGE_PASSWORD, element: <LazyWrapper><ChangePasswordPage /></LazyWrapper> },
          { path: ROUTES.APPS, element: <LazyWrapper><AppListPage /></LazyWrapper> },

          // Admin routes
          {
            element: <AdminGuard />,
            children: [
              { path: ROUTES.ADMIN_EMPLOYEES, element: <LazyWrapper><EmployeeListPage /></LazyWrapper> },
              { path: ROUTES.ADMIN_EMPLOYEE_DETAIL, element: <LazyWrapper><EmployeeDetailPage /></LazyWrapper> },
              { path: ROUTES.ADMIN_JABATAN, element: <LazyWrapper><JabatanPage /></LazyWrapper> },
              { path: ROUTES.ADMIN_CLIENTS, element: <LazyWrapper><ClientListPage /></LazyWrapper> },
              { path: ROUTES.ADMIN_CLIENT_DETAIL, element: <LazyWrapper><ClientDetailPage /></LazyWrapper> },
              { path: ROUTES.ADMIN_ROLE_MAPPINGS, element: <LazyWrapper><RoleMappingPage /></LazyWrapper> },
            ],
          },
        ],
      },
    ],
  },

  // Catch-all redirect
  { path: '*', element: <LazyWrapper><LoginPage /></LazyWrapper> },
]);
