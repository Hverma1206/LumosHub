import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token and name from URL parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const name = params.get('name');

    // console.log('AuthSuccess - token:', token, 'name:', name);

    if (token && name) {
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userName', decodeURIComponent(name));
      
      // Verify storage worked
      const verifyToken = localStorage.getItem('token');
      const verifyName = localStorage.getItem('userName');
      
      // console.log('Verified localStorage:', {
      //   token: verifyToken,
      //   userName: verifyName
      // });
      
      if (verifyToken && verifyName) {
        // Use setTimeout with longer delay and state update
        setTimeout(() => {
          navigate('/room-join', { replace: true });
        }, 200);
      } else {
        // console.error('Failed to store in localStorage');
        navigate('/login', { replace: true });
      }
    } else {
      // console.log('No token or name found, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#0f0f0f',
      color: '#e6edf3',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <p>Processing login...</p>
      <p style={{ fontSize: '0.9rem', color: '#8b949e' }}>Redirecting to room join...</p>
    </div>
  );
};

export default AuthSuccess;
