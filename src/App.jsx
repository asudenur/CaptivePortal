import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import MaterialRequest from './components/MaterialRequest';
import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import backgroundImage from '/tulpars.jpeg';

const Background = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: '#2a2a2a',
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: '1000px',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  zIndex: -1,
});

const MainContent = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Background />
      <MainContent>
        <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/material-request"
              element={
                <PrivateRoute>
                  <MaterialRequest />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Container>
      </MainContent>
    </Router>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
