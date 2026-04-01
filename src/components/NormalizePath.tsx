import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const normalizePathname = (pathname: string) => pathname.replace(/\/{2,}/g, '/');

const NormalizePath = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const normalized = normalizePathname(location.pathname);
    if (normalized !== location.pathname) {
      navigate(
        { pathname: normalized, search: location.search, hash: location.hash },
        { replace: true }
      );
    }
  }, [location.hash, location.pathname, location.search, navigate]);

  return null;
};

export default NormalizePath;

