import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';
import MyJobsPage from './pages/MyJobsPage';
import CustomerPortalPage from './pages/CustomerPortalPage';
import CustomersPage from './pages/CustomersPage';
import PartsPage from './pages/PartsPage';

/** Send a freshly-logged-in user to the landing page that makes sense for their role. */
function RoleLanding() {
  const { role } = useAuth();
  switch (role) {
    case 'DISPATCHER':
    case 'MANAGER':
      return <Navigate to="/dashboard" replace />;
    case 'TECHNICIAN':
      return <Navigate to="/my-jobs" replace />;
    case 'CUSTOMER':
      return <Navigate to="/portal" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<RoleLanding />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['DISPATCHER', 'MANAGER']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/board"
          element={
            <ProtectedRoute roles={['DISPATCHER', 'MANAGER']}>
              <BoardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute roles={['DISPATCHER', 'MANAGER']}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parts"
          element={
            <ProtectedRoute roles={['MANAGER']}>
              <PartsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute roles={['TECHNICIAN']}>
              <MyJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <CustomerPortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/work-orders/:id"
          element={
            <ProtectedRoute roles={['DISPATCHER', 'MANAGER', 'TECHNICIAN', 'CUSTOMER']}>
              <WorkOrderDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
