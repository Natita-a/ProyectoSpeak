import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TemaAleatorio.css';
import api from '../components/User';


const PracticaTemaAleatorio = () => {
  const navigate = useNavigate();
  const [tema, setTema] = useState('');
  const [situacion, setSituacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Para que cambie solamente en esta pagina el body
  useEffect(() => {
    document.body.classList.add('fondo-tema-aleatorio');
    return () => {
      document.body.classList.remove('fondo-tema-aleatorio');
    };
  }, []);

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
  onClick={async () => {
    try {
     const response = await api.post('escena-aleatoria/', {
        simulacion_id: situacion.id  // Usar el id de la situacion
      });
      navigate('/pages/PracticaAleatoria',{
        state:{
          tiempo:situacion.tiempo,
           practica_hecha_id: response.data.practica_hecha_id
        }
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
      )}
    </div>
  );
};

export default PracticaTemaAleatorio;