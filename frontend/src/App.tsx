import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import DefectsPage from './pages/DefectsPage';
import UploadPage from './pages/UploadPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'defects', element: <DefectsPage /> },
      { path: 'upload', element: <UploadPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
