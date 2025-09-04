// src/components/Header.js
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import TransactionModal from "../components/TransactionModal";
import Transactions from '../pages/Transactions';
import Transacoes from '../pages/Transacoes';
import Savings from '../pages/Savings';


const Header = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="app-header">
      <div className="logo">
        Controle Financeiro
      </div>
      <button className="menu-toggle" onClick={toggleMenu}>
        &#9776; {/* Hamburger Icon */}
      </button>
      <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/" className="nav-link" onClick={() => isMenuOpen && toggleMenu()}>Dashboard</Link>
        <Link to="/transactions" className="nav-link" onClick={() => isMenuOpen && toggleMenu()}>Transações</Link>
        <Link to="/savings" className="nav-link" onClick={() => isMenuOpen && toggleMenu()}>Economias</Link>
        <Link onClick={() => { handleLogout(); if (isMenuOpen) toggleMenu(); }} className="nav-link">Logout</Link>
      </nav>
    </header>
  );
};

export default Header;
