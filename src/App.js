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
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing';
import SignIn from './pages/Login'; 
import SignUp from './pages/Registro';
import Home from './pages/Home'
import PracticaMenu from './components/Practicas';
import Logout from './components/Logout';
import CheckboxLabels from './pages/Formulario1';
import CheckboxLabelsPreferences from './pages/Formulario2';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="pages/Login" element={<SignIn />} />
        <Route path="pages/Registro" element={<SignUp />} />
       <Route path="pages/Home" element={<Home />} />
       <Route path="pages/Formulario1" element={<CheckboxLabels/>}/>
       <Route path="pages/Formulario2" element={<CheckboxLabelsPreferences/>}/>
        <Route path="pages/Practicas" element={<PracticaMenu />} />
        <Route path="/logout" element={<Logout redirectTo="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

