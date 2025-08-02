import React,{useEffect,useState}from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import api from '../components/User';

const HistorialdePracticas=()=>{
  const navigate=useNavigate();
  const [rows,setRows]=useState([]);
  const[loading,setLoading]=useState(true);
  const [error,setError]=useState(null);



  const handleVerReporte=(practicaHechaId)=>{
    navigate('/pages/reporte', { state: { practica_hecha_id: practicaHechaId } });
  };



useEffect(()=>{
  const fetchPracticas=async()=>{
    try{
      const response=await api.get('/practicas-hechas/');
      //Filtra practicas con retroalimentacion vacia
      const datosFormateados=response.data
      .filter(item=>
        !item.aspectos_evaluados || 
        !item.aspectos_evaluados.retroalimentacion || 
        item.aspectos_evaluados.retroalimentacion.trim()=== ''
      )
      .map(item=>({
        id:item.id,
        simulacion_id:item.simulacion_id,
        fecha:new Date(item.fecha).toLocaleDateString(),
        estado:item.estado,
        tiempo_duracion:item.tiempo_duracion,
        tipo_simulacion:item.simulacion?.tipo_simulacion || '',
      }));

      setRows(datosFormateados);
    }catch(err){
      setError('Error al cargar las practicas.');
    }finally{
      setLoading(false);
    };
  }

        fetchPracticas();
  }, []);

  if (loading) {
    return (
      <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 10, maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  

  return (
    <>
      <Navbar />
      <Box
        sx={{
          height: 500,
          width: '90%',
          maxWidth: 800,
          mx: 'auto',
          p: 2,
          mt: 0,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          Historial de Prácticas
        </Typography>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'id', headerName: 'ID', flex: 0.2, minWidth: 30 },
            { field: 'fecha', headerName: 'Fecha', flex: 0.6, minWidth: 80 },
            { field: 'estado', headerName: 'Estado', flex: 0.4, minWidth: 60 },
            { field: 'tiempo_duracion', headerName: 'Duración', flex: 0.4, minWidth: 60 },
            { field: 'tipo_simulacion', headerName: 'Simulación', flex: 0.6, minWidth: 80 },
            {
              field: 'ver_reporte',
              headerName: 'Reporte',
              flex: 0.4,
              minWidth: 80,
              sortable: false,
              filterable: false,
              renderCell: (params) => (
                <button
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                  onClick={() => handleVerReporte(params.row.id)}
                >
                  Ver Reporte
                </button>
              ),
            },
          ]}
          pageSize={10}
          rowsPerPageOptions={[5, 10]}
          rowHeight={30}
          autoHeight
          sx={{
            fontSize: '12px',
            '& .MuiDataGrid-cell': {
              padding: '2px 6px',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f0f0f0',
              minHeight: 30,
            },
            '& .MuiDataGrid-row': {
              minHeight: 30,
            },
          }}
        />
      </Box>
    </>
  );
};

export default HistorialdePracticas;


