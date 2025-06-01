import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="hero">
      <nav className="nav container">
        <div className="nav__logo">
          <h2 className="nav__title">SpeakUp</h2>
        </div>

        <ul className="nav__link nav__link--menu">
          <li className="nav__items"><Link to="/" className="nav__links">Inicio</Link></li>
          <li className="nav__items"><Link to="pages/Acerca" className="nav__links">Acerca de</Link></li>
          <li className="nav__items"><Link to="pages/Contacto" className="nav__links">Contacto</Link></li>
          <li className="nav__items"><Link to="pages/Blog" className="nav__links">Blog</Link></li>
          <li className="nav__items"><Link to="pages/Login" className="nav__links">Iniciar Sesión</Link></li>
        </ul>
      </nav>

      <section className="hero__container container">
        <h1 className="hero__title">Aprende a comunicarte con SpeakUp</h1>
        <p className="hero__paragraph">
          Elige desarollar una de habilidades blandas más apreciadas dentro del ámbito  social y profesional
        </p>
        <Link to="/pages/Login" className="cta">Comienza ahora</Link>
      </section>
    </header>
  );
}

export default Header;
