import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h2>ReLire</h2>
          <p className="footer-tagline">Vos livres méritent une seconde lecture</p>
          <p className="footer-subtitle">Marketplace C2C de livres d'occasion • Spécialisation Éducative</p>
        </div>

        <div className="footer-sections">
          <div className="footer-section">
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/books">Livres</Link></li>
              <li><Link to="/listings">Annonces</Link></li>
              <li><Link to="/profile">Profil</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Pour qui ?</h4>
            <ul>
              <li>👩‍🏫 Enseignants</li>
              <li>👨‍👩‍👧‍👦 Parents</li>
              <li>🎓 Étudiants</li>
              <li>📖 Lecteurs Passionnés</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>📧 contact@relire.ca</li>
              <li>📍 Montréal, Québec</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 ReLire - Tous droits réservés</p>
          <p className="footer-mission">Donnez une seconde vie à vos livres 🌱</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
