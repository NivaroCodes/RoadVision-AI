import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import DefectsPage from './pages/DefectsPage';
import UploadPage from './pages/UploadPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthPage from './pages/AuthPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import MyDefectsPage from './pages/MyDefectsPage';
import UsersPage from './pages/UsersPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { useAuth } from './features/auth/useAuth';

function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <DashboardPage />;
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
      { path: 'map', element: <ProtectedRoute roles={['admin', 'road_service']}><MapPage /></ProtectedRoute> },
      { path: 'defects', element: <ProtectedRoute roles={['admin', 'road_service']}><DefectsPage /></ProtectedRoute> },
      { path: 'upload', element: <ProtectedRoute roles={['admin', 'resident']}><UploadPage /></ProtectedRoute> },
      { path: 'my-requests', element: <ProtectedRoute roles={['resident']}><MyDefectsPage /></ProtectedRoute> },
      { path: 'users', element: <ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute> },
      { path: 'access-denied', element: <AccessDeniedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
