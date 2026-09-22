import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const token = localStorage.getItem('accessToken');
  const userJson = localStorage.getItem('user');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let user: { role?: string } | null = null;

  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch {
    localStorage.removeItem('user');
  }

  if (adminOnly && user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}