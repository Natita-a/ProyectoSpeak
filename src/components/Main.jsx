// src/components/Main.js
import React from 'react';
import '../styles/landing.css';

function Main() {
  return (
    <main>
      <section className="container about">
        <h2 className="subtitle">¿Qué aprenderás en SpeakUp?</h2>
        <p className="about__paragraph">
          Todo lo necesario para expresarte con confianza 
        </p>

        <div className="about__main">
          <article className="about__icons">
            <img src="/images/shapes.png" className="about__icon" alt="CSS Layout" />
            <h3 className="about__title">Mejora tus habilidades comunicativas</h3>
            <p className="about__parrafo">Practica tus habilidades comunicativas en escenarios personalizados</p>
          </article>

          <article className="about__icons">
            <img src="/images/paint.png" className="about__icon" alt="Custom Properties" />
            <h3 className="about__title"> Comunicación Efectiva</h3>
            <p className="about__parrafo">Transmite un mensaje facilmente mediante la elaboración de un discurso oral claro , coherente y estructurado. </p>
          </article>

          <article className="about__icons">
            <img src="/images/code.png" className="about__icon" alt="Animaciones" />
            <h3 className="about__title">Manejo del Discurso</h3>
            <p className="about__parrafo">Desarrollar confianza y transmite seguridad al estar frente a un publico.</p>
          </article>
        </div>
      </section>

      <section className="knowledge">
        <div className="knowledge__container container">
          <div className="knowledge__texts">
            <h2 className="subtitle">¡Transforma tu manera de comunicarte, para siempre!</h2>
            <p className="knowledge__paragraph">
             Fortalece tus habilidades comunicativas , mejora tus  relaciones interpersonales y aumenta tus oportunidades profesionales
            </p>
          </div>

          <figure className="knowledge__picture">
            <img src="/images/presentacion.jpg" className="knowledge__img" alt="Macbook con CSS" />
          </figure>
        </div>
      </section>

    </main>
  );
}



export default Main;