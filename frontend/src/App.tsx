import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { useAuth } from './features/auth/useAuth';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const DefectsPage = lazy(() => import('./pages/DefectsPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage'));
const MyDefectsPage = lazy(() => import('./pages/MyDefectsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AccessPage = lazy(() => import('./pages/AccessPage'));

function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (user?.role === 'road_service') return <Navigate to="/map" replace />;
  return <Navigate to="/upload" replace />;
}

const router = createBrowserRouter([
  { path: '/login', element: <AuthPage mode="login" /> },
  { path: '/register', element: <AuthPage mode="register" /> },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'dashboard', element: <ProtectedRoute roles={['admin']}><DashboardPage /></ProtectedRoute> },
      { path: 'map', element: <ProtectedRoute roles={['admin', 'road_service']}><MapPage /></ProtectedRoute> },
      { path: 'defects', element: <ProtectedRoute roles={['admin', 'road_service']}><DefectsPage /></ProtectedRoute> },
      { path: 'upload', element: <ProtectedRoute roles={['admin', 'resident']}><UploadPage /></ProtectedRoute> },
      { path: 'my-requests', element: <ProtectedRoute roles={['resident']}><MyDefectsPage /></ProtectedRoute> },
      { path: 'users', element: <ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
      { path: 'access', element: <ProtectedRoute roles={['admin']}><AccessPage /></ProtectedRoute> },
      { path: 'access-denied', element: <AccessDeniedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Загрузка…</div>}><RouterProvider router={router} /></Suspense>;
}
