import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useRequireLogin = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback((message = 'Please login to continue') => {
    if (isAuthenticated) return false;
    toast.error(message);
    const from = location.pathname + location.search + location.hash;
    navigate('/login', { replace: false, state: { from } });
    return true;
  }, [isAuthenticated, location.hash, location.pathname, location.search, navigate]);
};

