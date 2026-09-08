import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROUTES } from '../../config/routes';

export default function AdminGuard() {
  const { isAdmin } = useAuthStore();

  if (!isAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
