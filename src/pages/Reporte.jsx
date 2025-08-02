import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../components/User";
import {
  Typography,
  Container,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';



export default function Reporte(){
  const Location=useLocation();
  const practicaHechaId=Location.state?.practica_hecha_id;
  const[aspectos,setAspectos]=useState(null);
  const [error, setError]=useState('');


  useEffect(()=>{
    if(practicaHechaId){
      api.get(`aspectos-evaluados/${practicaHechaId}/`)
      .then(res=>{
        setAspectos(res.data);
      })
      .catch(err=>{
        console.error('Error al obtener aspectos evaluados:',err);
        setError('No se pudieron cargar los aspectos evaluados.');
      });
    }
  },[practicaHechaId]);

  if(error)return<Alert severity="error">{error}</Alert>;
  if(!aspectos)return <Box textAlign="center" mt={4}><CircularProgress/></Box>;

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#eaeef1', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md" sx={{ mt: 0, borderRadius: 2 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              Aspectos Evaluados
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" gutterBottom>
             <strong>Lenguaje Corporal:</strong>{aspectos.lenguaje_corporal || 'No evaluado'}
            </Typography>
            <Typography variant="body1" gutterBottom>
             <strong>Palabras por minuto:</strong>{aspectos.palabras_por_minuto}
            </Typography>
            <Typography variant="body1" gutterBottom>
             <strong>Tono:</strong>{aspectos.tono || 'No evaluado'}
            </Typography>
            <Typography variant="body1" gutterBottom>
             <strong>Claridad:</strong>{aspectos.claridad || 'No evaluado'}
            </Typography>
             <Typography variant="body1" gutterBottom>
             <strong>Coherencia:</strong>{aspectos.coherencia}
            </Typography>
             <Typography variant="body1" gutterBottom>
             <strong>Velocidad:</strong>{aspectos.velocidad}
            </Typography>
            <Typography variant="body1" gutterBottom>
             <strong>Retroalimentacion:</strong>{aspectos.retroalimentacion}
            </Typography>
                        {aspectos.errores && Object.keys(aspectos.errores).length > 0 ? (
              <>
                <Typography variant="body1" gutterBottom sx={{ color: 'error.main', fontWeight: 'bold' }}>
                  Errores:
                </Typography>
                <ul>
                  {Object.entries(aspectos.errores).map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </>
            ) : (
              <Typography variant="body1" gutterBottom>
                <strong>Errores:</strong> Sin errores detectados
              </Typography>
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );

}
