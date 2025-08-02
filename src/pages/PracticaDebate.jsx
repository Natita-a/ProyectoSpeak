import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/TemaDebate.css';
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


const PracticaModoDebate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const situacionData = location.state?.situacion;

  const tema = situacionData?.tema;
  const info = situacionData?.situacion;


  const[openModal,setOpenModal]=useState(false);

  // Verifica si se pasaron los datos si no regresa a la pagina anterior
  useEffect(() => {
    if (!situacionData) {
      navigate('/pages/SeleccionarModo');
    }
  }, [situacionData, navigate]);

 
  useEffect(() => {
    document.body.classList.add('fondo-tema-debate');
    return () => {
      document.body.classList.remove('fondo-tema-debate');
    };
  }, []);

  if (!situacionData || !info) return <p>Cargando situación...</p>;

  console.log("SITUACIÓN RECIBIDA:", situacionData);


        const handleAceptar= async () => {
            try {
              const response = await api.post('escena-aleatoria/', {
                simulacion_id: info.id,
              });
              navigate('/pages/RecordDebate', {
                state: {
                  tiempo: info.tiempo,
                  practica_hecha_id: response.data.practica_hecha_id,
                },
              });
            } catch (error) {
              alert('Error al iniciar la práctica');
              console.error(error);
            }
          }
        

  return (
    <div id="tema-propio1">
      <h2 className="titulo">
        Tema seleccionado: <span className="tema">{tema}</span>
      </h2>

      <h3 className="subtitulo">Situación para practicar:</h3>
      <div id="tema-propio2" className="situacion">
        <p><strong>Título:</strong> {info.titulo}</p>
        <p><strong>Contexto:</strong> {info.contexto}</p>
        <p><strong>Recomendación:</strong> {info.recomendacion}</p>
        <p><strong>Tiempo:</strong> {info.tiempo} minutos</p>

        <button className='boton-tema-debate' onClick={()=>setOpenModal(true)}>
          Iniciar Práctica
        </button>
      </div>
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
            Una vez iniciada la práctica, no podrás regresar. Tendrás {info?.tiempo} minutos para desarrollar la situación asignada.
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
export default PracticaModoDebate;
