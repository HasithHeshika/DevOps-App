import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Components/Home/Home';
import Login from './Components/Login/Login';
import SignUp from './Components/Login/SignUp';
import Properties from './Components/Properties/Properties';
import Services from './Components/Services/Services';
import About from './Components/About/About';
import Contact from './Components/Contact/Contact';
import Dashboard from './Components/Dashboard/Dashboard';
import './Styles/App.css';

// Placeholder components for other pages
const Terms = () => <div className="page"><h1>Terms of Service</h1><p>Coming Soon...</p></div>;
const Privacy = () => <div className="page"><h1>Privacy Policy</h1><p>Coming Soon...</p></div>;
const ForgotPassword = () => <div className="page"><h1>Forgot Password</h1><p>Coming Soon...</p></div>;

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Read auth token from localStorage on mount and when storage changes
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    syncAuth();
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <Router>
      <div className="App">
        {/* Navigation Header */}
        <header className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo" onClick={closeMenu}>
              <span className="logo-icon">🏡</span>
              PropertyHub
            </Link>
            
            <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
              <Link to="/" className="nav-link" onClick={closeMenu}>
                Home
              </Link>
              <Link to="/properties" className="nav-link" onClick={closeMenu}>
                Properties
              </Link>
              <Link to="/services" className="nav-link" onClick={closeMenu}>
                Services
              </Link>
              <Link to="/about" className="nav-link" onClick={closeMenu}>
                About Us
              </Link>
              <Link to="/contact" className="nav-link" onClick={closeMenu}>
                Contact
              </Link>
              
              {isLoggedIn ? (
                <Link to="/dashboard" className="nav-link nav-cta" onClick={closeMenu}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="nav-link nav-cta" onClick={closeMenu}>
                    Login
                  </Link>
                  <Link to="/signup" className="nav-link nav-cta" onClick={closeMenu}>
                    Sign Up
                  </Link>
                </>
              )}
            </nav>

            <div className={`nav-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-icon">🏡</span>
                <h3>PropertyHub</h3>
              </div>
              <p>Your trusted partner in property management and real estate solutions.</p>
              <div className="social-links">
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="Twitter">🐦</a>
                <a href="#" aria-label="Instagram">📷</a>
                <a href="#" aria-label="LinkedIn">💼</a>
              </div>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/properties">Properties</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/about">About Us</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li><a href="#">Property Sales</a></li>
                <li><a href="#">Land Development</a></li>
                <li><a href="#">Property Management</a></li>
                <li><a href="#">Investment Consulting</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact Info</h4>
              <div className="contact-info">
                <p>📍 123 Main Street, Colombo, Sri Lanka</p>
                <p>📞 +94 11 234 5678</p>
                <p>✉️ info@propertyhub.lk</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-container">
              <p>&copy; 2024 PropertyHub. All rights reserved.</p>
              <div className="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;