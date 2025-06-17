import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ redirectTo = '/' }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Borra los tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Redirige a la página que quieres
    navigate(redirectTo);
  }, [navigate, redirectTo]);

  return null;
};

export default Logout;
