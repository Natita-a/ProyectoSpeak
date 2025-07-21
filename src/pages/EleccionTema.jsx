import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import api from '../components/User';

export default function CheckboxTema() {
  const [selected, setSelected] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const options = [
    { label: 'Modo Exposicion', name: 'modo_exposicion' },
    { label: 'Modo Debate', name: 'modo_debate' },
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
  if (!selected) {
    setError('Por favor, selecciona una opción.');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    if (selected === 'modo_debate') {

      const response = await api.get('generar-modo-debate');
      const situacion = response.data;
      const titulo=response.data

      console.log('Situación generada:', situacion);


      navigate('/pages/PracticaDebate', { state: { situacion} });

    } else if (selected === 'modo_exposicion') {

      const response = await api.get('generar-modo-exposicion');
      const situacion = response.data;
      const titulo=response.data

      console.log('Situación generada:', situacion);


      navigate('/pages/PracticaExposicion',{state:{situacion}});
    }

  } catch (err) {
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
        setError('Error desconocido al obtener la situación.');
      }
    } else {
      setError('Error de conexión o servidor.');
    }
  } finally {
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
        //backgroundColor: '#f9f9f9',
        //minHeight: '100vh',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          marginBottom: 15,
          color: '#333',
        }}
      >
        ¿En que formato te gustaria practicar?
      </Typography>

      {options.map(({ label, name }) => (
        <Box
          key={name}
          sx={{
            width: 450,
            height: 120,
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
          marginTop: 13,
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