import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <section className="footer__container container">
        <nav className="nav nav--footer">
          <h2 className="footer__title">SpeakUp</h2>
          <ul className="nav__link nav__link--footer">
            <li className="nav__items">
              <a href="#" className="nav__links">Inicio</a>
            </li>
            <li className="nav__items">
              <a href="#" className="nav__links">Acerca de</a>
            </li>
            <li className="nav__items">
              <a href="#" className="nav__links">Contacto</a>
            </li>
          </ul>
        </nav>

        <form className="footer__form">
          <h2 className="footer__newsletter">Suscríbete a la newsletter</h2>
          <div className="footer__inputs">
            <input
              type="email"
              placeholder="Email"
              className="footer__input"
            />
            <input
              type="submit"
              value="Registrarse"
              className="footer__submit"
            />
          </div>
        </form>
      </section>

      <section className="footer__copy container">
        <div className="footer__social">
          <a href="#" className="footer__icons">
            <img src="/images/facebook.svg" className="footer__img" alt="Facebook" />
          </a>
          <a href="#" className="footer__icons">
            <img src="/images/twitter.svg" className="footer__img" alt="Twitter" />
          </a>
          <a href="#" className="footer__icons">
            <img src="/images/youtube.svg" className="footer__img" alt="YouTube" />
          </a>
        </div>

        <h3 className="footer__copyright">
          &copy; 2025 SpeakUp | Todos los derechos reservados
        </h3>
      </section>
    </footer>
  );
}

export default Footer;
