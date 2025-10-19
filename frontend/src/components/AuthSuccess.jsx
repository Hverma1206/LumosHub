import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../utils/authService';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      authService.setToken(token);
      // Optionally fetch user profile here
      navigate('/room-join');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Authenticating...</p>
    </div>
  );
};

export default AuthSuccess;
