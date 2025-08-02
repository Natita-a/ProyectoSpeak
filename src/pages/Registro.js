import * as React from 'react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import api from '../components/User';



function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function SignUp() {
  const [emailError,setEmailError]=useState('');
  const [password, setPassword]=useState('');
  const [passwordError, setPasswordError]=useState('');
  const [passwordChecks,setPasswordChecks]=useState([false,false,false,false,false]);


const passwordRequirements=[
  {label:'Exactamente 8 caracteres',test:(pw)=>pw.length===8},
  {label:'Al menos una letra mayuscula',test:(pw)=> /[A-Z]/.test(pw)},
  {label:'Al menos una letra miniscula',test:(pw)=> /[a-z]/.test(pw)},
  {label: 'Al menos un numero',test:(pw)=> /[0-9]/.test(pw) },
  { label:'Al menos un caracter especial (!@#$%^&*)', test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
]


const isValidEmail=(email)=>{
  return  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


const handlePasswordChange=(e)=>{
 const newPass=e.target.value;
 setPassword(newPass);

 const checks=passwordRequirements.map(req => req.test(newPass));
 setPasswordChecks(checks)
};


const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const email = data.get('email');
    const password = data.get('password');


    if(!isValidEmail(email)){
      setEmailError('Introduce un correo electronico valido.');

      setTimeout(()=>setEmailError(''),3000);
      
      return
    }

    const checks=passwordRequirements.map(req =>req.test(password));
    setPasswordChecks(checks);

    if(!checks.every(Boolean)){
      setPasswordError('La contraseña no cumple con todos los requisitos.');
      setTimeout(()=>setPasswordError(''),4000);
      return;
    }


    try {
      const response = await api.post('registro/', {
        email,
        password,
      });

      alert('Usuario registrado con éxito');
      console.log(response.data);
    } catch (error) {
      alert('Error al registrar');
      console.error(error);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
            <img src="/images/favicon.png" alt="Logo" style={{ width: '80px', height: '80px' }} />
        </Typography>

         <Typography component="h2" variant="h6" sx={{ mt: 2 }}>
           Registro
        </Typography>


        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            type="email"
            error={!!emailError}
            helperText={emailError}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError}
            inputProps={{maxLength:8}}
          />
           <Box mt={1} sx={{ textAlign: 'left' }}>
            {passwordRequirements.map((req, index) => (
              <Typography
                key={index}
                variant="body2"
                color={passwordChecks[index] ? 'green' : 'error'}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                {passwordChecks[index] ? '✔️' : '❌'} {req.label}
              </Typography>
            ))}
          </Box>
          <FormControlLabel
            control={<Checkbox value="acceptTerms" color="primary" />}
            label="I accept the terms and conditions"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid>
              <Link component={RouterLink} to="/pages/Login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

