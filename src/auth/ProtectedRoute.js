import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';

export default function ProtectedRoute({ children }) {
  const { authenticated } = useContext(AuthContext);
  if (!authenticated) return <Navigate to="/" replace />;
  return children;
}
