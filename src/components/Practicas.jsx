import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Practicas.css'

const PracticaMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="practica-container">
      <h1 className="titulo-practica">¿Qué te gustaría hacer hoy?</h1>

      <div className="tarjeta-practica">
        <img src="/images/tema-aleatorio.png" alt="Tema aleatorio" className="imagen-practica" />
        <div className="contenido-practica">
          <p className="texto-practica">Practique con un tema aleatorio</p>
          <button className="boton-ir" onClick={() => navigate('/practica/aleatorio')}>
            Ir
          </button>
        </div>
      </div>

      <div className="tarjeta-practica">
        <img src="/images/tema-propio.png" alt="Tema propio" className="imagen-practica" />
        <div className="contenido-practica">
          <p className="texto-practica">Elige un tema propio</p>
          <button className="boton-ir" onClick={() => navigate('/practica/tema')}>
            Ir
          </button>
        </div>
      </div>

      <div className="tarjeta-practica">
        <img src="/images/tema-eleccion.png" alt="Tema propio" className="imagen-practica" />
        <div className="contenido-practica">
          <p className="texto-practica">Elige entre debate o exposicion</p>
          <button className="boton-ir" onClick={() => navigate('/practica/tema')}>
            Ir
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticaMenu;
