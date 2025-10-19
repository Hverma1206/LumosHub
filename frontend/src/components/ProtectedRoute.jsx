import { Navigate } from 'react-router-dom';
import { authService } from '../utils/authService';

const ProtectedRoute = ({ children }) => {
  const token = authService.getToken();
  const isAuthenticated = token && token !== 'anonymous';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
