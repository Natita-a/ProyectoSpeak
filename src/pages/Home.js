import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PracticaMenu from '../components/Practicas';
import '../styles/Home.css'; 
import '../styles/Practicas.css';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/pages/Login');  // o la ruta que tengas para login
    }
  }, [navigate]);

  return (
    <>
      <header className="home-header"></header>
      <Navbar />
      <PracticaMenu />
    </>
  );
}

export default Home;
