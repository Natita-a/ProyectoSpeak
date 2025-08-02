import React from "react";
import "../styles/Loader.css";

function LoaderMicrofonoOndas({ loaderOpen = false }) {
  if (!loaderOpen) return null;

  return (
    <div className="loader-container">
      <div className="wave">
        <div className="bar bar1"></div>
        <div className="bar bar2"></div>
        <div className="bar bar3"></div>
        <div className="bar bar4"></div>
        <div className="bar bar5"></div>
      </div>
      <p className="loader-text">Obteniendo tus resultados...</p>
    </div>
  );
}

export default LoaderMicrofonoOndas;
