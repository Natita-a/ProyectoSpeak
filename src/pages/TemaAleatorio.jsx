import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TemaAleatorio.css';
import api from '../components/User';

import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 420,
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: '0px 10px 30px rgba(0,0,0,0.2)',
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const PracticaTemaAleatorio = () => {
  const navigate = useNavigate();
  const [tema, setTema] = useState('');
  const [situacion, setSituacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false); 

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await api.get('generar-tema-aleatorio/');
        const data = res.data;
        setTema(data.tema);
        setSituacion(data.situacion);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.detail || 'Error al obtener datos');
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  useEffect(() => {
    document.body.classList.add('fondo-tema-aleatorio');
    return () => {
      document.body.classList.remove('fondo-tema-aleatorio');
    };
  }, []);

  const handleAceptar = async () => {
    try {
      const response = await api.post('escena-aleatoria/', {
        simulacion_id: situacion.id,
      });
      navigate('/pages/PracticaAleatoria', {
        state: {
          tiempo: situacion.tiempo,
          practica_hecha_id: response.data.practica_hecha_id,
        },
      });
    } catch (error) {
      alert('Error al iniciar la práctica');
      console.error(error);
    }
  };

  if (loading) return <p>Cargando situación...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div id="tema-propio1">
      <h2 className="titulo">
        Tema seleccionado: <span className="tema">{tema}</span>
      </h2>

      <h3 className="subtitulo">Situación para practicar:</h3>
      {situacion && (
        <div id="tema-propio2" className="situacion">
          <p>
            <strong>Título:</strong> {situacion.titulo}
          </p>
          <p>
            <strong>Contexto:</strong> {situacion.contexto}
          </p>
          <p>
            <strong>Recomendación:</strong> {situacion.recomendacion}
          </p>
          <p>
            <strong>Tiempo:</strong> {situacion.tiempo} minutos
          </p>

          <button
            className="boton-tema-aleatorio"
            onClick={() => setOpenModal(true)}
          >
            Iniciar Práctica
          </button>
        </div>
      )}

      {/* Modal de confirmación */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={modalStyle}>
          <IconButton
            onClick={() => setOpenModal(false)}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ¿Estás lista/o para comenzar?
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Una vez iniciada la práctica, no podrás regresar. Tendrás{' '}
            {situacion?.tiempo} minutos para desarrollar la situación asignada.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAceptar}
            >
              Aceptar
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default PracticaTemaAleatorio;
