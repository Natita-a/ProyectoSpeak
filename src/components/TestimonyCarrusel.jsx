import React, { useState } from 'react';
import '../styles/landing.css';

const testimonies = [
  {
    id: 1,
    name: 'Sebastian Rios',
    course: 'Usuario de SpeakUp',
    review: '"SpeakUp me ayudó a mejorar mis habilidades de argumentación para reuniones laborales.',
    image: '/images/face1.jpg',
    alt: 'Sebastian Rios',
  },
  {
    id: 2,
    name: 'Alejandra Perez',
    course: 'Usuario de SpeakUp',
    review: '"Me encanta practicar con SpeakUp por diversión. El Modo Aleatorio hace que cada sesión sea diferente, y siento que mi fluidez ha mejorado un montón"',
    image: '/images/face2.jpg',
    alt: 'Alejandra Perez',
  },
  {
    id: 3,
    name: 'Karla Rodriguez',
    course: 'Usuario de SpeakUp',
    review: '"Cada simulación me ayuda a expresarme mejor y organizar mis ideas. La evaluación al final es muy útil para ver qué mejorar"',
    image: '/images/face3.jpg',
    alt: 'Karla Rodriguez',
  },
  {
    id: 4,
    name: 'Kevin Ramirez',
    course: 'Usuario de SpeakUp',
    review: '"Siempre me ponía nervioso al hablar en público, pero con SpeakUp he podido practicar sin presión. Me gusta cómo analiza mi tono, velocidad y claridad, y me da sugerencias prácticas".',
    image: '/images/face4.jpg',
    alt: 'Kevin Ramirez',
  },
];

const TestimonyCarousel = () => {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % testimonies.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + testimonies.length) % testimonies.length);
  };

  return (
    <section className="testimony">
      <div className="testimony__container container">
        <img
          src="/images/leftarrow.svg"
          className="testimony__arrow"
          alt="Flecha izquierda"
          onClick={handlePrev}
        />

        {testimonies.map((item, index) => (
          <section
            key={item.id}
            className={`testimony__body ${index === current ? 'testimony__body--show' : ''}`}
            data-id={item.id}
          >
            <div className="testimony__texts">
              <h2 className="subtitle">
                Mi nombre es {item.name}, <span className="testimony__course">{item.course}</span>
              </h2>
              <p className="testimony__review">{item.review}</p>
            </div>
            <figure className="testimony__picture">
              <img src={item.image} className="testimony__img" alt={item.alt} />
            </figure>
          </section>
        ))}

        <img
          src="/images/rightarrow.svg"
          className="testimony__arrow"
          alt="Flecha derecha"
          onClick={handleNext}
        />
      </div>
    </section>
  );
};

export default TestimonyCarousel;
