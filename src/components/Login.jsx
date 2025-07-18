import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'rgba(30, 30, 30, 0.7)',
  backdropFilter: 'blur(3px)',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.23)',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1rem',
    transition: 'all 0.2s ease-in-out',
    '&.Mui-focused': {
      color: '#1976d2',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: 'rgba(255, 255, 255, 0.9)',
    padding: '16px 20px',
    fontSize: '1rem',
  },
});

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/material-request', { replace: true });
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 8, 
        mb: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <StyledPaper elevation={3}>
          <Typography
            variant="h5"
            component="div"
            align="center"
            sx={{
              mb: 2,
              color: 'white',
              fontWeight: 500,
              letterSpacing: '0.5px',
              textShadow: '1px 1px 3px rgba(0,0,0,0.15)',
            }}
          >
            TULPARSADA 
            <br />
            Ağına Hoşgeldiniz
          </Typography>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center" 
            sx={{ 
              mb: 4,
              color: 'white',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Giriş Yap
          </Typography>
          {error && <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              width: '100%',
              borderRadius: '12px',
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              color: '#ff3d3d',
              '& .MuiAlert-icon': {
                color: '#ff3d3d',
              },
            }}
          >
            {error}
          </Alert>}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="E-posta"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{ width: '187%' }}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Şifre"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ width: '187%' }}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              size="large"
              sx={{ 
                mt: 4, 
                mb: 2,
                height: '56px',
                backgroundColor: '#1976d2',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#1565c0',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </StyledPaper>
      </Box>
    </Container>
  );
} 