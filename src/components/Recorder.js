import React, { useState, useRef, useEffect } from "react";
import { FaStopCircle, FaMicrophone } from "react-icons/fa";
import { useLocation,useNavigate } from "react-router-dom";
import '../styles/Recorder.css';
import api from '../components/User';
import LoaderMicrofonoOndas from "./Loader";
import ModalFinal from "./ModalFinal";

export default function Recorder() {
  const [isRecording, setIsRecording] = useState(false);
  const location = useLocation();
  const tiempoInicialMinutos = location.state?.tiempo || 5;
  const [time, setTime] = useState(tiempoInicialMinutos * 60);
  const [transcripcion, setTranscripcion] = useState('');
  const [mensajeGuardado, setMensajeGuardado] = useState('');
  const [grabacionFinalizada,setGrabacionFinalizada]=useState(false);
  const [cargando,setCargando]=useState(false);
  const navigate=useNavigate();
  const mediaRecorder = useRef(null);
  const intervalId = useRef(null);
  const tiempoInicioRef=useRef(null);

  useEffect(() => {
    if (isRecording) {
      intervalId.current = setInterval(() => {
        setTime(t => {
          if (t <= 1) {
            clearInterval(intervalId.current);
            setIsRecording(false);
            mediaRecorder.current?.stop();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalId.current);
    }
    return () => clearInterval(intervalId.current);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

 const duracionRef = useRef(0); //Almacena la duracion real

const toggleRecording = async () => {
  if (isRecording) {
    const tiempoFin = Date.now();
    const duracionSegundos = Math.floor((tiempoFin - tiempoInicioRef.current) / 1000);
    duracionRef.current = duracionSegundos / 60; //Se convierte a minutos
    mediaRecorder.current?.stop();
    setIsRecording(false);
    setGrabacionFinalizada(true);
    setTimeout(()=>{
      setCargando(true);
    },2000)
  } else {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = async (e) => {
        setCargando(true);
        const audioBlob = new Blob([e.data], { type: "audio/wav" });

        const formData = new FormData();
        formData.append('audio', audioBlob, 'grabacion.wav');

        const practicaHechaId = location.state?.practica_hecha_id;
        if (!practicaHechaId) {
          setMensajeGuardado("Error: No se pudo identificar la práctica.");
          return;
        }
        formData.append('practica_hecha_id', practicaHechaId);

        try {
          const response = await api.post('transcripcion/', formData);
          const textoTranscrito = response.data.texto;
          setTranscripcion(textoTranscrito);

          const saveResponse = await api.post('guardar-transcripcion/', {
            practica_hecha_id: practicaHechaId,
            transcripcion: textoTranscrito,
            duracion: duracionRef.current //  Duración medida exactamente
          });
          setMensajeGuardado(saveResponse.data.mensaje);

           await api.patch(`practicas-hechas/${practicaHechaId}/estado/`, {
    estado: 'completada' //patch
  });

          setTimeout(()=>{
            navigate('/pages/Reporte',{state:{practica_hecha_id:practicaHechaId}});
          })
                       
        } catch (error) {
          console.error('Error durante la transcripción o guardado:', error);
          setMensajeGuardado("Error al procesar la transcripción.");
        }
      };

      tiempoInicioRef.current = Date.now(); // Se guarda el inicia en esta parte
      mediaRecorder.current.start();
      setIsRecording(true);
      setMensajeGuardado('');
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      setMensajeGuardado("Error al acceder al micrófono.");
    }
  }
};

if(cargando){
  return <LoaderMicrofonoOndas loaderOpen={true}/>
}

  return (
    <div className="recorder-container">
      <div className="top-panel"></div>

      <div className="bottom-panel">
        <h2 className="timer">{formatTime(time)}</h2>
        <div className="button-container">
          <button
            onClick={() => { if (isRecording) toggleRecording(); }}
            disabled={!isRecording}
            className={`stop-button ${!isRecording ? "disabled" : ""}`}
            title="Detener grabación"
          >
            <FaStopCircle className="icon" />
          </button>

          <button
            onClick={()=>{if(!isRecording && !grabacionFinalizada)toggleRecording();}}
            className="record-button"
            disabled={isRecording || grabacionFinalizada}
            title={ grabacionFinalizada ? "Grabacion finalizada" : isRecording ? "Grabando..." : "Iniciar grabación"}
          >
            <FaMicrophone className="icon" />
          </button>
        </div>
        {/*
        <div className="transcripcion-texto" style={{ marginTop: '20px', color: '#fff' }}>
          <h3>Transcripción:</h3>
          <p>{transcripcion || 'Aquí aparecerá la transcripción cuando termine la grabación.'}</p>
        </div>
*/}

        {mensajeGuardado && (
          <div style={{ marginTop: '10px', color: mensajeGuardado.includes('Error') ? 'red' : 'lightgreen' }}>
            {mensajeGuardado}
          </div>
        )}


      </div>
    </div>
  );
}
