// components/layout/Navbar.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { OfflineContext } from '../../contexts/OfflineContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { isOnline, hasPendingSyncs } = useContext(OfflineContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <img src="/logo.svg" alt="OmniLearn Logo" className="logo-image" />
            <span className="logo-text">OmniLearn</span>
          </Link>
        </div>

        {/* Status indicator */}
        {currentUser && (
          <div className="connection-status">
            <span 
              className={`status-indicator ${isOnline ? 'online' : 'offline'}`}
              title={isOnline ? 'Online' : 'Offline'}
            ></span>
            {!isOnline && <span className="status-text">Offline</span>}
            {isOnline && hasPendingSyncs() && (
              <span className="sync-pending" title="Sync pending">⟳</span>
            )}
          </div>
        )}

        {/* Mobile menu button */}
        <button 
          className="menu-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className={`menu-icon ${menuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Main navigation */}
        <nav className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          {currentUser ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link 
                to="/courses" 
                className={`nav-link ${isActive('/courses') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Courses
              </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Profile
              </Link>
              <Link 
                to="/settings" 
                className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Settings
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary logout-btn"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <button className="btn btn-primary">Register</button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

// components/layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">OmniLearn</h3>
          <p className="footer-description">
            Adaptive learning platform for everyone, everywhere, on any device.
          </p>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-heading">Resources</h4>
          <ul className="footer-links">
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/tutorials">Tutorials</Link></li>
            <li><Link to="/api">API Documentation</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/cookies">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="copyright">© {currentYear} OmniLearn. All rights reserved.</p>
        <div className="social-links">
          <a href="https://twitter.com/omnilearn" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <i className="social-icon twitter"></i>
          </a>
          <a href="https://linkedin.com/company/omnilearn" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <i className="social-icon linkedin"></i>
          </a>
          <a href="https://github.com/omnilearn" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <i className="social-icon github"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
