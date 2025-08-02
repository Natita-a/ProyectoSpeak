import React,{useEffect,useState} from 'react';
import { useNavigate } from 'react-router-dom';
import{
  Box,
  Typography,
  Button,
  CircularProgress,
  Checkbox,
  FormControlLabel,
}from '@mui/material'
import api from '../components/User';


const PracticaTemaPropioConSeleccion=()=>{
  const navigate=useNavigate();
  
  const [temas,setTemas]=useState([]);
  const [loadingTemas,setLoadingTemas]=useState(true);
  const [errorTemas,setErrorTemas]=useState('');
  const [temaSeleccionado,setTemaSeleccionado]=useState('');
  const [errorSeleccion,setErrorSeleccion]=useState('');
  const [loadingSituacion, setLoadingSituacion]=useState(false);
  const [errorSituacion,setErrorSituacion]=useState('');

  useEffect(()=>{
    const fetchTemas=async()=>{
      try{
        //Se obtienen los temas preferidos
        const res=await api.get('obtener-temas-preferidos/');
        setTemas(res.data.temas);
      }catch(error){
        setErrorTemas('Error al cargar los temas preferidos.');
      }finally{
        setLoadingTemas(false);
      }
    };
    fetchTemas();
  },[]);


  const handleChangeTema=(tema)=>(event)=>{
    if(event.target.checked){
      setTemaSeleccionado(tema);
    }else{
      setTemaSeleccionado('');
    }
    setErrorSeleccion('');
    setErrorSituacion('');
  };



  const handleGenerarSituacion=async()=>{
    if(!temaSeleccionado){
      //Pide que se seleccione un tema para poder hacer una simulacion de este 
      setErrorSeleccion('Por favor selecciona un tema.');
      return;
    }
    setLoadingSituacion(true);
    setErrorSituacion('');

    try{
      //Llama a generar-temas para generar la escena del tema seleccionado
      const res=await api.get('generar-temas/' ,{
        params:{tema:temaSeleccionado},
      });
      navigate('/pages/TemaPropioGenerado',{
        state:{
          tema:temaSeleccionado,
          situacion:res.data.situacion,
        },
      });
    }catch(error){
      setErrorSituacion(
        error.response?.data?.error || 'Error al generar la situación.'
      );
    }finally{
      setLoadingSituacion(false);
    }
  };

  if(loadingTemas)
    return(
     <Box sx={{display:'flex',justifyContent:'center',p:4}}>
      <Typography>Cargando temas preferidos...</Typography>
     </Box>
    );

  if(errorTemas)
    return(
     <Box sx={{ display:'flex',justifyContent:'center',p:4}}>
       <Typography color='error'>{errorTemas}</Typography>
     </Box>
    );

    return(
      <Box
       sx={{
        display:'flex',
        justifyContent:'center',
        p:4,
        backgroundColor:'#f0f0f0',
        minHeight:'100vh',
       }}
      >

      <Box sx={{maxWidth:500, width:'100%'}}>
        <Typography variant='h5' sx={{fontWeight:'bold', mb:3, textAlign:'center'}}>
          Selecciona el tema a practicar
        </Typography>

        {temas.length===0 &&(
          <Typography sx={{ textAlign:'center', mb:2}}>
           No tienes temas preferidos guardados.
          </Typography>
        )}

        
        {temas.map((tema)=>(
          <Box
          key={tema}
          sx={{
            width:'100%',
            height:100,
            border:'1px solid #ccc',
            borderRadius:3,
            display:'flex',
            alignItems:'center',
            paddingX:3,
            mb:2,
            backgroundColor:'#fff',
            boxShadow:temaSeleccionado===tema? 4:2,
            borderColor:temaSeleccionado===tema?'#1976d2':'#ccc',
            cursor:'pointer',
            transition: 'all 0.3s ease',
            '&:hover':{ 
              boxShadow:4,
              borderColor:'#1976d2',
            },
          }}
          onClick={()=>  
            temaSeleccionado=== tema
            ? setTemaSeleccionado('')
            : setTemaSeleccionado(tema)
          }
          >

            <FormControlLabel
              control={
                <Checkbox
                  checked={temaSeleccionado === tema}
                  onChange={handleChangeTema(tema)}
                  sx={{
                    color: '#1976d2',
                    '&.Mui-checked': {
                      color: '#1976d2',
                    },
                  }}
                />
              }
              label={<Typography sx={{ fontSize: 18 }}>{tema}</Typography>}
              sx={{ width: '100%', marginLeft: 1 }}
            />
          </Box>
        ))}

        {errorSeleccion && (
          <Typography color="error" sx={{mt:1,textAlign:'center'}}>
          {errorSeleccion}
          </Typography>
        )}


        <Button
        variant='contained'
        color='primary'
        onClick={handleGenerarSituacion}
        disabled={loadingSituacion}
        sx={{mt:3,display:'block',mx:'auto'}}
        >
          {loadingSituacion?(
            <CircularProgress size={24} color='inherit'/>
          ):(
            'Generar Situación'
          )}
        </Button>

        {errorSituacion && (
          <Typography color='error' sx={{mt:2, textAlign:'center'}}>
           {errorSituacion}
          </Typography>
        )}
      </Box>
      </Box>

    );
};


export default PracticaTemaPropioConSeleccion;
       

