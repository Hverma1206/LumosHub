import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  // Allow access if both token and userName exist
  if (token && userName) {
    return children;
  }

  // Redirect to login if not authenticated
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
