import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

/** Gate a route to specific roles - mirrors, but never substitutes for, the server-side @PreAuthorize checks. */
export default function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && !roles.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
