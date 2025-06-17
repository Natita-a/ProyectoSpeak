import React, { useState } from 'react';
import '../styles/landing.css';

const questions = [
  {
    title: '¿Qué es SpeakUp?',
    answer: 'SpeakUp es una plataforma de prácticas simuladas que permiten al usuario fortalecer sus habilidades comunicativas y expresarse con mayor seguridad.',
  },
  {
    title: '¿Qué aprenderé en SpeakUp?',
    answer:'Elaborar un discurso oral claro , coherente y estructurado considerando el tipo de discurso y el público objetivo para lograr el impacto deseado asi como el manejo adecuado del lenguaje corporal y gestión de emociones durante y después de una presentación frente a un público .'
  },
  {
    title: '¿Como funcionan las practicas?',
    answer: 'Práctica de la comunicación mediante ejercicios simulados personalizables que otorgan la posibilidad al usuario de una mejora continua a través de la retroalimentación.Al final de cada practica se puede ver un analisis del discurso asi como un analisis del lenguaje corporal.',
  }
];

const QuestionItem = ({ title, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className={`questions__padding ${isOpen ? 'questions__padding--add' : ''}`}>
      <div className="questions__answer">
        <h3 className="questions__title" onClick={() => setIsOpen(!isOpen)}>
          {title}
          <span className="questions__arrow">
            <img
              src="/images/arrow.svg"
              className={`questions__img ${isOpen ? 'questions__arrow--rotate' : ''}`}
              alt="Flecha desplegable"
            />
          </span>
        </h3>
        <p
          className="questions__show"
          style={{
            height: isOpen ? 'auto' : '0',
            overflow: 'hidden',
            transition: 'height 0.3s ease',
          }}
        >
          {answer}
        </p>
      </div>
    </article>
  );
};

const Questions = () => {
  return (
    <section className="questions container">
      <h2 className="subtitle">Preguntas frecuentes</h2>
      <p className="questions__paragraph">
        
      </p>

      <section className="questions__container">
        {questions.map((q, i) => (
          <QuestionItem key={i} title={q.title} answer={q.answer} />
        ))}
      </section>

      <section className="questions__offer">
        <h2 className="subtitle">¿Estás listo para aprender con SpeakUp?</h2>
        <p className="questions__copy">
          Atrevete a llevar tus habilidades comunicativas al siguiente nivel!
        </p>
      </section>
    </section>
  );
};

export default Questions;
