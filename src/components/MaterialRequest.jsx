import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  Grid
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
  marginBottom: theme.spacing(4),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(30, 30, 30, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  marginBottom: theme.spacing(4),
  position: 'relative',
  '& .MuiToolbar-root': {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: theme.spacing(2),
    borderRadius: '24px',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: 'rgba(30, 30, 30, 0.7)',
  backdropFilter: 'blur(3px)',
  borderRadius: 24,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  '& .MuiTableCell-head': {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 600,
    fontSize: '1rem',
    backgroundColor: 'rgba(25, 118, 210, 0.2)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
  },
  '& .MuiTableCell-body': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  '& .MuiTableRow-root': {
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
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

const MATERIAL_OPTIONS = [
  'Enjektör',
  'Gazlı Bez',
  'Tıbbi Makas',
  'Amonyak Ampülü',
  'CPR Yüz Maskesi',
  'Betadin',
  'Turnike',
  'Glikoz Tableti',
  'Strip Bandaj',
];

const MaterialButton = styled(Button)(({ theme, selected }) => ({
  backgroundColor: selected ? '#1976d2' : '#e3f2fd',
  color: selected ? '#fff' : '#1976d2',
  fontWeight: 600,
  fontSize: '1.1rem',
  borderRadius: 16,
  minWidth: 160,
  minHeight: 56,
  padding: theme.spacing(2, 3),
  margin: theme.spacing(1),
  boxShadow: selected ? '0 0 0 4px #90caf9' : '0 2px 8px rgba(25, 118, 210, 0.10)',
  border: selected ? '2px solid #1976d2' : '1px solid #90caf9',
  transition: 'all 0.2s',
  textTransform: 'none',
  letterSpacing: '0.5px',
  '&:hover': {
    backgroundColor: selected ? '#1565c0' : '#bbdefb',
    color: '#1565c0',
    boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)',
    borderColor: '#1976d2',
  },
}));

export default function MaterialRequest() {
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [records, setRecords] = useState([]);
  const { currentUser, logout } = useAuth();

  // Yeni serbest giriş için state
  const [customMaterial, setCustomMaterial] = useState('');
  const [customQuantity, setCustomQuantity] = useState('');

  useEffect(() => {
    if (currentUser?.uid) {
      loadMaterialRequests();
    }
    // eslint-disable-next-line
  }, [currentUser]);

  const loadMaterialRequests = async () => {
    const q = query(collection(db, 'malzemeKayitlari'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    // Sadece kendi kayıtlarını göster
    const data = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(rec => rec.userId === currentUser?.uid);
    setRecords(data);
  };

  const getUserInfo = async () => {
    if (!currentUser?.uid) return {};
    const userDoc = await getDoc(doc(db, 'users_info', currentUser.uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterial || !quantity) return;
    const userInfo = await getUserInfo();
    let latitude = "";
    let longitude = "";
    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            resolve();
          },
          () => resolve()
        );
      });
    }
    await addDoc(collection(db, 'malzemeKayitlari'), {
      firstName: userInfo.firstName || "",
      lastName: userInfo.lastName || "",
      latitude,
      longitude,
      materialName: selectedMaterial,
      organization: userInfo.organization || "",
      quantity: Number(quantity),
      timestamp: new Date(),
      userId: currentUser?.uid || ""
    });
    setSelectedMaterial('');
    setQuantity('');
    loadMaterialRequests();
  };

  // Serbest giriş için handler
  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customMaterial || !customQuantity) return;
    const userInfo = await getUserInfo();
    await addDoc(collection(db, 'malzemeKayitlari'), {
      firstName: userInfo.firstName || "",
      lastName: userInfo.lastName || "",
      latitude: "",
      longitude: "",
      materialName: customMaterial,
      organization: userInfo.organization || "",
      quantity: Number(customQuantity),
      timestamp: new Date(),
      userId: currentUser?.uid || ""
    });
    setCustomMaterial('');
    setCustomQuantity('');
    loadMaterialRequests();
  };

  return (
    <>
      <StyledAppBar position="static">
        <Container maxWidth="lg">
          <Toolbar sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                color: 'white',
                letterSpacing: '0.5px',
              }}
            >
              TULPARSADA
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 3
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'white',
                  opacity: 0.9,
                  fontWeight: 500
                }}
              >
                Hoşgeldiniz, {currentUser?.firstName} {currentUser?.lastName}
              </Typography>
              <Button 
                onClick={logout}
                variant="contained"
                sx={{
                  backgroundColor: '#ff3333',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '8px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#ff0000',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(255, 0, 0, 0.3)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                Çıkış Yap
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>

      <Container maxWidth="lg">
        <StyledPaper>
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
            Eksik Malzeme Bildirimi
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
              {MATERIAL_OPTIONS.map((mat) => (
                <Grid item key={mat}>
                  <MaterialButton
                    type="button"
                    selected={selectedMaterial === mat}
                    onClick={() => setSelectedMaterial(mat)}
                  >
                    {mat}
                  </MaterialButton>
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={3} direction="column" alignItems="center">
              <Grid item xs={12} sx={{ width: '100%', maxWidth: '400px' }}>
                <StyledTextField
                  fullWidth
                  label="Miktar"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!selectedMaterial || !quantity}
                  sx={{
                    backgroundColor: '#1976d2',
                    color: '#ffffff',
                    borderRadius: '16px',
                    padding: '12px 32px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                      color: '#666',
                    },
                  }}
                >
                  Malzeme Talebi Gönder
                </Button>
              </Grid>
            </Grid>
          </form>
        </StyledPaper>

        {/* Serbest Giriş Bölümü */}
        <StyledPaper>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            align="center" 
            sx={{ 
              mb: 3,
              color: 'white',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Özel Malzeme Talebi
          </Typography>
          <form onSubmit={handleCustomSubmit} style={{ width: '100%' }}>
            <Grid container spacing={3} direction="column" alignItems="center">
              <Grid item xs={12} sx={{ width: '100%', maxWidth: '400px' }}>
                <StyledTextField
                  fullWidth
                  label="Malzeme Adı"
                  value={customMaterial}
                  onChange={(e) => setCustomMaterial(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%', maxWidth: '400px' }}>
                <StyledTextField
                  fullWidth
                  label="Miktar"
                  type="number"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(e.target.value)}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!customMaterial || !customQuantity}
                  sx={{
                    backgroundColor: '#4caf50',
                    color: '#ffffff',
                    borderRadius: '16px',
                    padding: '12px 32px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#388e3c',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                      color: '#666',
                    },
                  }}
                >
                  Özel Talep Gönder
                </Button>
              </Grid>
            </Grid>
          </form>
        </StyledPaper>

        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            color: 'white',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          Son Bildirimler
        </Typography>
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Malzeme</TableCell>
                <TableCell>Miktar</TableCell>
                <TableCell>Bildiren</TableCell>
                <TableCell>Kurum</TableCell>
                <TableCell>Konum</TableCell>
                <TableCell>Tarih</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell>{rec.materialName}</TableCell>
                  <TableCell>{rec.quantity}</TableCell>
                  <TableCell>{`${rec.firstName} ${rec.lastName}`}</TableCell>
                  <TableCell>{rec.organization}</TableCell>
                  <TableCell>
                    {rec.latitude && rec.longitude ? `${rec.latitude}, ${rec.longitude}` : "Konum yok"}
                  </TableCell>
                  <TableCell>
                    {rec.timestamp && rec.timestamp.toDate
                      ? rec.timestamp.toDate().toLocaleString("tr-TR")
                      : new Date(rec.timestamp).toLocaleString("tr-TR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </Container>
    </>
  );
}
