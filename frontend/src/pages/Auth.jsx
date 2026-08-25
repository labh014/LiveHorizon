import React, { useContext, useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

const defaultTheme = createTheme({
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  palette: {
    primary: {
      main: '#1a73e8',
    },
  },
});

export default function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState(0); // 0 = Sign In, 1 = Sign Up
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { handleRegister, handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  // Read preset authMode (from landing page click)
  useEffect(() => {
    const savedMode = localStorage.getItem('authMode');
    if (savedMode === 'register') {
      setFormState(1);
      localStorage.removeItem('authMode');
    }
  }, []);

  const switchTab = (tab) => {
    setFormState(tab);
    setError('');
    setUsername('');
    setPassword('');
    setName('');
  };

  const handleAuth = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Username and password fields are required.');
      return;
    }
    if (formState === 1 && !name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    try {
      if (formState === 0) {
        // Sign In
        await handleLogin(username.trim(), password);
        navigate("/home");
      } else {
        // Sign Up
        let result = await handleRegister(name.trim(), username.trim(), password);
        setMessage(result || 'Registration successful! Please login.');
        setOpenSnackbar(true);
        setFormState(0); // Switch to Sign In after registration
        setUsername(username.trim()); // Keep username filled for ease
        setPassword('');
        setName('');
      }
    } catch (err) {
      console.error(err);
      let errMsg = 'Connection error. Please try again later.';
      if (err.response && err.response.data && err.response.data.message) {
        const serverMsg = err.response.data.message;
        if (serverMsg === 'User existing') {
          errMsg = 'A user with this username already exists.';
        } else if (serverMsg === 'User not found') {
          errMsg = 'No account found with this username.';
        } else if (serverMsg === 'Invalid credentials') {
          errMsg = 'Incorrect username or password.';
        } else {
          errMsg = serverMsg;
        }
      }
      setError(errMsg);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <CssBaseline />
        
        {/* Left Visual side */}
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'linear-gradient(rgba(26, 115, 232, 0.15), rgba(0, 0, 0, 0.6)), url(/vc.webp)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            p: 6,
            color: 'white',
          }}
        >
          <Box sx={{ maxWidth: '480px', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="h3" fontWeight="700" gutterBottom sx={{ letterSpacing: '-1.5px' }}>
              Connect securely from anywhere
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85, fontSize: '17px', lineHeight: 1.6 }}>
              Experience low-latency WebRTC video conferencing, real-time messaging, and interactive profile dashboards.
            </Typography>
          </Box>
        </Grid>

        {/* Right Auth form side */}
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              my: 8,
              mx: 4,
              width: '100%',
              maxWidth: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Logo */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, cursor: 'pointer' }}
              onClick={() => navigate("/")}
            >
              <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="8" fill="#1a73e8"/>
                <path d="M25 21V15C25 14.45 24.55 14 24 14H12C11.45 14 11 14.45 11 15V21C11 21.55 11.45 22 12 22H24C24.55 22 25 21.55 25 21ZM20 18H16V16H20V18ZM29 13L26 16V20L29 23V13Z" fill="white"/>
              </svg>
              <Typography variant="h5" fontWeight="500" sx={{ color: '#3c4043', letterSpacing: '-0.5px' }}>
                Live<span style={{ color: '#1a73e8', fontWeight: '700' }}>Horizon</span>
              </Typography>
            </Box>

            {/* Slider Switch Tab Container */}
            <Box 
              sx={{ 
                display: 'flex', 
                border: '1px solid #e0e0e0', 
                borderRadius: '30px', 
                padding: '3px', 
                width: '100%', 
                mb: 4, 
                bgcolor: '#f8f9fa' 
              }}
            >
              <Button 
                fullWidth 
                onClick={() => switchTab(0)}
                sx={{ 
                  borderRadius: '28px', 
                  bgcolor: formState === 0 ? '#1a73e8' : 'transparent',
                  color: formState === 0 ? 'white' : '#5f6368',
                  '&:hover': { bgcolor: formState === 0 ? '#1557b0' : 'rgba(0,0,0,0.04)' },
                  textTransform: 'none',
                  fontWeight: '600',
                  py: 1
                }}
              >
                Sign In
              </Button>
              <Button 
                fullWidth 
                onClick={() => switchTab(1)}
                sx={{ 
                  borderRadius: '28px', 
                  bgcolor: formState === 1 ? '#1a73e8' : 'transparent',
                  color: formState === 1 ? 'white' : '#5f6368',
                  '&:hover': { bgcolor: formState === 1 ? '#1557b0' : 'rgba(0,0,0,0.04)' },
                  textTransform: 'none',
                  fontWeight: '600',
                  py: 1
                }}
              >
                Sign Up
              </Button>
            </Box>

            <Typography variant="h5" fontWeight="600" sx={{ mb: 1, color: '#202124', width: '100%', textAlign: 'left' }}>
              {formState === 0 ? "Welcome back" : "Create your account"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#5f6368', width: '100%', textAlign: 'left' }}>
              {formState === 0 ? "Please enter your credentials to login" : "Get started with your free secure profile"}
            </Typography>

            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="fullname"
                  label="Full Name"
                  name="fullname"
                  autoComplete="name"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                  sx={{ mb: 2 }}
                />
              )}
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete={formState === 0 ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />

              {/* Styled Alert Banner for Error Feedback */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 2, 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    '& .MuiAlert-icon': { alignSelf: 'center' }
                  }}
                >
                  {error}
                </Alert>
              )}

              <Button
                type="button"
                fullWidth
                variant="contained"
                onClick={handleAuth}
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5, 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  fontSize: '15px',
                  textTransform: 'none'
                }}
              >
                {formState === 1 ? "Sign up" : "Sign In"}
              </Button>

              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                {formState === 0 ? "Don't have an account? " : "Already have an account? "}
                <span 
                  onClick={() => switchTab(formState === 0 ? 1 : 0)}
                  style={{ color: '#1a73e8', fontWeight: '600', cursor: 'pointer' }}
                >
                  {formState === 0 ? "Sign up free" : "Sign in instead"}
                </span>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        message={message}
      />
    </ThemeProvider>
  );
}