import { Navigate } from 'react-router-dom';

interface Props {
  children: JSX.Element;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const token = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" />;

  if (adminOnly && user.email !== 'admin@bitforex.com') {
    return <Navigate to="/" />;
  }

  return children;
}