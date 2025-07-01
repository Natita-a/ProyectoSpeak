import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import api from '../components/User';

export default function CheckboxLabels() {
  const [selected, setSelected] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const options = [
    { label: 'Educativo', name: 'educativo' },
    { label: 'Profesional', name: 'profesional' },
    { label: 'Recreativo', name: 'recreativo' },
  ];

  const handleChange = (name) => (event) => {
    if (event.target.checked) {
      setSelected(name);
    } else {
      setSelected(null);
    }
    setError(null);
  };

  
 const handleSubmit = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await api.post('guardar-proposito/', {
      proposito: selected,
    });

    console.log('Guardado correctamente:', response.data);
    setLoading(false);
    navigate('/pages/Formulario2');
  } catch (err) {
    setLoading(false);
    if (err.response && err.response.data) {
      const data = err.response.data;
      if (typeof data === 'object') {
        const errores = Object.entries(data)
          .map(([campo, mensaje]) =>
            `${campo}: ${Array.isArray(mensaje) ? mensaje.join(', ') : mensaje}`
          )
          .join(' | ');
        setError(errores);
      } else {
        setError('Error desconocido al guardar.');
      }
    } else {
      setError('Error de conexión o servidor.');
    }
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
        ¿Con qué propósito utilizas la aplicación?
      </Typography>

      {options.map(({ label, name }) => (
        <Box
          key={name}
          sx={{
            width: 600,
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
                checked={selected === name}
                onChange={handleChange(name)}
                name={name}
                disabled={selected !== null && selected !== name}
                sx={{
                  color: '#1976d2',
                  '&.Mui-checked': {
                    color: '#1976d2',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 18, color: '#333' }}>
                {label}
              </Typography>
            }
          />
        </Box>
      ))}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={!selected || loading}
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
