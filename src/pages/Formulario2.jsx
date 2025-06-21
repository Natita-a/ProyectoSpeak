import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';

export default function CheckboxLabelsPreferences() {
  const [selected, setSelected] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');

  const options = [
    { label: 'Trabajo', name: 'Trabajo' },
    { label: 'Atención a Clientes', name: 'Atencion a Clientes' },
    { label: 'Vida Cotidiana', name: 'Vida Cotidiana' },
    { label: 'Educación', name: 'Educacion' },
    { label: 'Redes Sociales', name: 'Redes Sociales' },
    { label: 'Situaciones de Emergencia', name: 'Situaciones de Emergencia' },
  ];

  const handleChange = (name) => (event) => {
    if (event.target.checked) {
      if (selected.length < 3) {
        setSelected([...selected, name]);
      } else {
        setError('Solo puedes seleccionar hasta 3 temas.');
      }
    } else {
      setSelected(selected.filter((item) => item !== name));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/guardar-temas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ temas_preferencia: selected }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errores = Object.entries(data)
          .map(([campo, mensaje]) =>
            `${campo}: ${Array.isArray(mensaje) ? mensaje.join(', ') : mensaje}`
          )
          .join(' | ');
        setError(errores || 'Error desconocido.');
        setLoading(false);
        return;
      }

      navigate('/pages/Home');
    } catch (err) {
      console.error('Error al enviar:', err);
      setError('Error de red al guardar las preferencias');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: 4,
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          marginBottom: 6,
          color: '#333',
        }}
      >
        ¿Cuáles son tus temas de preferencia?
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {options.slice(0, 3).map(({ label, name }) => (
              <Box
                key={name}
                sx={{
                  height: 100,
                  border: '1px solid #ccc',
                  borderRadius: 3,
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  paddingX: 3,
                  backgroundColor: '#fff',
                  boxShadow: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: '#1976d2',
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selected.includes(name)}
                      onChange={handleChange(name)}
                      name={name}
                      sx={{
                        color: '#1976d2',
                        '&.Mui-checked': {
                          color: '#1976d2',
                        },
                      }}
                    />
                  }
                  label={<Typography sx={{ fontSize: 18, color: '#333' }}>{label}</Typography>}
                />
              </Box>
            ))}
          </Box>
        </Grid>

        <Grid item xs={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {options.slice(3, 6).map(({ label, name }) => (
              <Box
                key={name}
                sx={{
                  height: 100,
                  border: '1px solid #ccc',
                  borderRadius: 3,
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  paddingX: 3,
                  backgroundColor: '#fff',
                  boxShadow: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: '#1976d2',
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selected.includes(name)}
                      onChange={handleChange(name)}
                      name={name}
                      sx={{
                        color: '#1976d2',
                        '&.Mui-checked': {
                          color: '#1976d2',
                        },
                      }}
                    />
                  }
                  label={<Typography sx={{ fontSize: 18, color: '#333' }}>{label}</Typography>}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={selected.length !== 3 || loading}
        sx={{
          marginTop: 6,
          paddingX: 5,
          paddingY: 1.5,
          fontSize: 16,
          borderRadius: 2,
          position: 'relative',
        }}
      >
        {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Siguiente'}
      </Button>

      {error && (
        <Typography
          variant="body1"
          sx={{ color: 'red', marginTop: 2, maxWidth: 600, textAlign: 'center' }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}
