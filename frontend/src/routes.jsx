import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import AuthSuccess from './components/AuthSuccess';
import RoomJoin from './components/RoomJoin';
import CodeEditor from './components/CodeEditor';
import ProtectedRoute from './components/ProtectedRoute';
import App from './App';

const routes = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/auth/success',
    element: <AuthSuccess />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/room-join',
        element: (
          <ProtectedRoute>
            <RoomJoin />
          </ProtectedRoute>
        ),
      },
      {
        path: '/editor/:roomId',
        element: (
          <ProtectedRoute>
            <CodeEditor />
          </ProtectedRoute>
        ),
      },
      {
        path: '/',
        element: <Navigate to="/room-join" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default routes;
