import React from 'react';
import { MdHome } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { Link } from 'react-router-dom';
import { FaHistory } from "react-icons/fa";
import { IoHelpCircle } from "react-icons/io5";
import { IoIosExit } from "react-icons/io";



const Navbar = () => {
  return (
    <div className="sidenav">

      <img src="/images/favicon.png" alt="Logo" style={{ width: '80px', height: '80px' }} />


      <ul className='ul-home'>
        <li>
    <Link to='#'>
      <MdHome />
      Inicio
    </Link>
       </li>
         <li>
             <Link to='#'>
      <IoMdSettings />
      Configuracion
    </Link>
        </li>
         <li>
            <Link to='#'>
      <FaHistory/>
      Historial
    </Link>
        </li>
          <li>
             <Link to='#'>
      <IoHelpCircle/>
      Ayuda
    </Link>
        </li>
        <li>
           <Link to='/logout'>
      <IoIosExit/>
      Cerrar Sesion
    </Link>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
