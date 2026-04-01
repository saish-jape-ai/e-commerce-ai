import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const RedirectIfAuthed = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/profile" replace />;
  return children;
};

export default RedirectIfAuthed;

