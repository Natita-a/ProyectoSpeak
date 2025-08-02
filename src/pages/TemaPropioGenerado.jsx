import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../components/User';
import '../styles/TemaPropio.css';
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';



const modalStyle={
  position:'absolute',
  top:'50%',
  left: '50%',
  transform: 'translate(-50% , -50%)',
  width:420,
  bgcolor:'background.paper',
  borderRadius:'16px',
  boxShadow:'0px 10px 30px rgba(0,0,0,0.2)',
  p:4,
  display:'flex',
  flexDirection:'column',
  gap:2,
};

const TemaPropioGenerado=()=>{
  const navigate=useNavigate();
  const location =useLocation();

  const[openModal,setOpenModal]=useState(false);

  const situacion=location.state?.situacion;
  const tema=location.state?.tema;

  useEffect(()=>{
    if(!situacion || !tema ){
      navigate('/pages/SeleccionarTemaPropio');
    }
  },[situacion , tema , navigate]);

  const handleAceptar=async()=>{
    try{
      const res= await api.post('escena-propia/',{
        simulacion_id:situacion.id,
      });
      navigate('/pages/PracticaPropia', {
        state:{
          tiempo:situacion.tiempo,
          practica_hecha_id:res.data.practica_hecha_id,
        },
      });
    }catch(error){
      alert('Error al iniciar la practica');
      console.error(error);
    }
  };


  useEffect(()=>{
    document.body.classList.add('fondo-tema-propio');
    return()=>{
      document.body.classList.remove('fondo-tema-propio');
    };
  }, []);

  if(!situacion) return <p>Cargando situacion...</p>;

  return(
  <div id="tema-propio">
    <h2 className='titulo'>
      Tema seleccionado:<span className='tema'>{tema}</span>
    </h2>

    <h3 className='subtitulo'>Situacion para practicar:</h3>
    <div id="tema-propio2" className="situacion">
      <p><strong>Titulo:</strong>{situacion.titulo}</p>
      <p><strong>Contexto:</strong>{situacion.contexto}</p>
      <p><strong>Recomendacion:</strong>{situacion.recomendacion}</p>
      <p><strong>Tiempo:</strong>{situacion.tiempo} minutos</p>

      <button className='boton-tema' onClick={()=>setOpenModal(true)}>
      Iniciar Practica
      </button>
  </div>

  <Modal open={openModal} onClose={()=>setOpenModal(false)}>
    <Box sx={modalStyle}>
      <IconButton
      onClick={()=> setOpenModal(false)}
      sx={{
        position:'absolute',
        top:12,
        right:12,
        color:'grey.500',
      }}
      >
        <CloseIcon/>
        </IconButton>

        <Typography variant='h6' sx={{fontWeight:'bold'}}>
         ¿Estas lista/o para comenzar?
        </Typography>
        
         <Typography variant='body2' color="text.secondary">
           Una vez iniciada la práctica, no podrás regresar. Tendrás {situacion.tiempo} minutos para desarrollar la situación asignada.
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


export default TemaPropioGenerado;

