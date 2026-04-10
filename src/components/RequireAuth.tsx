import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <p className="text-sm text-muted-foreground font-body">Loadingâ€¦</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />;
  }

  return children;
};

export default RequireAuth;

