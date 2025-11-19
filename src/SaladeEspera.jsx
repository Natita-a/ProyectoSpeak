import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import api from "../components/User";

export default function SalaEsperaDebate() {
  const [usersCount, setUsersCount] = useState(0);
  const [showSecond, setShowSecond] = useState(false); // controla visibilidad segundo jugador
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const socket = new WebSocket(
      `ws://localhost:8000/ws/speakup-lobby/?token=${token}`
    );

    socket.onopen = () => console.log("✅ Conectado al lobby de emparejamiento");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "connected-users") {
        setUsersCount(data.count);

        if (data.count >= 2) {
          setTimeout(() => setShowSecond(true), 2000); // muestra segundo jugador tras 2s
        }
      }

      // 🔹 Retrasar la navegación antes de ir a la práctica
      if (data.action === "paired") {
        setTimeout(() => {
          navigate("/pages/PracticaDebate", {
            state: { situacion: data.situacion },
          });
        }, 3000); // 3000 ms = 3 segundos de delay antes de navegar
      }
    };

    socket.onclose = () => console.log("❌ Desconectado del lobby");

    return () => socket.close();
  }, [navigate]);

  return (
    <div
      style={{
        backgroundColor: "rgb(80, 42, 116)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Lobby de Debate</h1>
      <p>Usuarios conectados: {usersCount}</p>

      {usersCount < 2 && <p>Esperando otro usuario para emparejar...</p>}
      {usersCount >= 2 && !showSecond && <p>Emparejando en unos segundos...</p>}
      {usersCount >= 2 && showSecond && <p>Se emparejó con otro usuario.</p>}

      {/* Contenedores con íconos */}
      <div
        style={{
          display: "flex",
          gap: "50px",
          marginTop: "30px",
        }}
      >
        {/* Contenedor 1 */}
        <div
          id="par1"
          className="pares"
          style={{
            backgroundColor: "white",
            color: "black",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          }}
        >
          <FaUser size={50} color="black" />
        </div>

        {/* Contenedor 2 - aparece tras delay */}
        {showSecond && (
          <div
            id="par2"
            className="pares"
            style={{
              backgroundColor: "white",
              color: "black",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <FaUser size={50} color="black" />
          </div>
        )}
      </div>
    </div>
  );
}
