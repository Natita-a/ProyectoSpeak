/*import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/


/*import { useEffect, useState } from 'react';


function App() {
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/Proyecto/hola/')
      .then(res => res.json())
      .then(data => setMensaje(data.mensaje));
  }, []);

  return (
    <div>
      <h1>{mensaje}</h1>
    </div>
  );
}

export default App;
*/
// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/landing';
import SignIn from './pages/Login';
import SignUp from './pages/Registro';
import Home from './pages/Home';
import PracticaMenu from './components/Practicas';
import Logout from './components/Logout';
import CheckboxLabels from './pages/Formulario1';
import CheckboxLabelsPreferences from './pages/Formulario2';
import PracticaTemaPropio from './pages/TemaPropio';
import Recorder from './components/Recorder';
//import Recorder from './pages/PracticaPropia';
//import PracticaAleatoria from './pages/PracticaAleatoria';
import PracticaTemaAleatorio from './pages/TemaAleatorio';
import CheckboxTema from './pages/EleccionTema';
import PracticaModoDebate from './pages/PracticaDebate';
import PracticaModoExposicion from './pages/PracticaExposicion';
//import PracticaDebate from './pages/RecordDebate';
//import PracticaExposicion from './pages/RecordExposicion';






function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/pages/Login" replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);  // true si hay token
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pages/Login" element={<SignIn />} />
        <Route path="/pages/Registro" element={<SignUp />} />
        <Route
          path="/pages/Home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/pages/Formulario1"
          element={
            <PrivateRoute>
              <CheckboxLabels />
            </PrivateRoute>
          }
        />
        <Route
          path="/pages/Formulario2"
          element={
            <PrivateRoute>
              <CheckboxLabelsPreferences />
            </PrivateRoute>
          }
        />
        <Route
          path="/pages/Practicas"
          element={
            <PrivateRoute>
              <PracticaMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/practica/tema-propio"
          element={
            <PrivateRoute>
              <PracticaTemaPropio />
            </PrivateRoute>
          }
        />

         <Route
          path="/practica/aleatorio"
          element={
            <PrivateRoute>
              <PracticaTemaAleatorio />
            </PrivateRoute>
          }
        />

         <Route
          path="/pages/PracticaPropia"
          element={
            <PrivateRoute>
               <Recorder modo="propia" />
            </PrivateRoute>
          }
        />

           <Route
          path="/pages/TemaAleatorio"
          element={
            <PrivateRoute>
              <PracticaTemaAleatorio />
            </PrivateRoute>
          }
        />


          <Route
          path="/pages/PracticaAleatoria"
          element={
            <PrivateRoute>
               <Recorder modo="aleatoria" />
            </PrivateRoute>
          }
        />
        

        <Route
         path="/pages/EleccionTema" 
         element={
         <PrivateRoute>
          <CheckboxTema/>
         </PrivateRoute>
         }
         />

         <Route
         path="/pages/PracticaDebate" 
         element={
         <PrivateRoute>
          <PracticaModoDebate/>
         </PrivateRoute>
         }
         />


           <Route
         path="/pages/PracticaExposicion" 
         element={
         <PrivateRoute>
          <PracticaModoExposicion/>
         </PrivateRoute>
         }
         />


        
          <Route
          path="/pages/RecordDebate"
          element={
            <PrivateRoute>
               <Recorder modo="debate" />
            </PrivateRoute>
          }
        />
          
          <Route
          path="/pages/RecordExposicion"
          element={
            <PrivateRoute>
               <Recorder modo="exposicion" />
            </PrivateRoute>
          }
        />

         
       
        <Route path="/logout" element={<Logout redirectTo="/" />} />
      </Routes>
    </Router>
  );
}

export default App;


