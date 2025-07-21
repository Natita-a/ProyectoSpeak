import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/TemaExposicion.css';
import api from '../components/User';

const PracticaModoExposicion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const situacionData = location.state?.situacion;

  const tema = situacionData?.tema;
  const info = situacionData?.situacion;

  // Verifica si se pasaron los datos si no regresa a la pagina anterior
  useEffect(() => {
    if (!situacionData) {
      navigate('/pages/SeleccionarModo');
    }
  }, [situacionData, navigate]);

 
  useEffect(() => {
    document.body.classList.add('fondo-tema-exposicion');
    return () => {
      document.body.classList.remove('fondo-tema-exposicion');
    };
  }, []);

  if (!situacionData || !info) return <p>Cargando situación...</p>;

  console.log("SITUACIÓN RECIBIDA:", situacionData);

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

        <button
          className="boton-tema-exposicion"
          onClick={async () => {
            try {
              const response = await api.post('escena-aleatoria/', {
                simulacion_id: info.id,
              });
              navigate('/pages/RecordExposicion', {
                state: {
                  tiempo: info.tiempo,
                  practica_hecha_id: response.data.practica_hecha_id,
                },
              });
            } catch (error) {
              alert('Error al iniciar la práctica');
              console.error(error);
            }
          }}
        >
          Iniciar Práctica
        </button>
      </div>
    </div>
  );
};

export default PracticaModoExposicion;
