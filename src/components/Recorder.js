import React, { useState, useRef, useEffect } from "react";
import { FaStopCircle, FaMicrophone } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import '../styles/Recorder.css';
import api from '../components/User';

export default function Recorder() {
  const [isRecording, setIsRecording] = useState(false);
  const location = useLocation();
  const tiempoInicialMinutos = location.state?.tiempo || 5;
  const [time, setTime] = useState(tiempoInicialMinutos * 60);
  const [transcripcion, setTranscripcion] = useState('');
  const [mensajeGuardado, setMensajeGuardado] = useState('');
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

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);

        mediaRecorder.current.ondataavailable = async (e) => {
          const audioBlob = new Blob([e.data], { type: "audio/wav" });

          const formData = new FormData();
          formData.append('audio', audioBlob, 'grabacion.wav');

          // Obtener practica_hecha_id de location.state
          const practicaHechaId = location.state?.practica_hecha_id;
          if (!practicaHechaId) {
            setMensajeGuardado("Error: No se pudo identificar la práctica.");
            return;
          }
          formData.append('practica_hecha_id', practicaHechaId);

          try {
            //  Subir audio y obtener transcripción
            const response = await api.post('transcripcion/', formData);
            const textoTranscrito = response.data.texto;
            setTranscripcion(textoTranscrito);

            // Guarda la transcripción en aspectos_evaluados

          const tiempoFin=Date.now();
          const duracionRealSegundos = Math.max(1, Math.floor((tiempoFin - tiempoInicioRef.current) / 1000));
          const duracionMinutos=duracionRealSegundos/60

            const saveResponse = await api.post('guardar-transcripcion/', {
              practica_hecha_id: practicaHechaId,
              transcripcion: textoTranscrito,
              duracion:duracionMinutos
            });
            setMensajeGuardado(saveResponse.data.mensaje);
          } catch (error) {
            console.error('Error durante la transcripción o guardado:', error);
            setMensajeGuardado("Error al procesar la transcripción.");
          }
        };

        tiempoInicioRef.current=Date.now();
        mediaRecorder.current.start();
        setIsRecording(true);
        setMensajeGuardado('');
      } catch (err) {
        console.error("Error al acceder al micrófono:", err);
        setMensajeGuardado("Error al acceder al micrófono.");
      }
    }
  };

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
            onClick={toggleRecording}
            className="record-button"
            title={isRecording ? "Grabando..." : "Iniciar grabación"}
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
