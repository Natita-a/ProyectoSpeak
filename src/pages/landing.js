// src/pages/LandingPage.js
import React from 'react';
import Header from '../components/Header';
import Main from '../components/Main';
import Questions from '../components/Questions';
import TestimonyCarousel from '../components/TestimonyCarrusel';
import Footer from '../components/Footer';
import '../styles/landing.css';

function LandingPage() {
  return (
    <>
      <Header />
      <Main />
      <TestimonyCarousel/>
      <Questions/>
      <Footer />
    </>
  );
}

export default LandingPage;
