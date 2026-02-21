import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton,
  UserButton 
} from '@clerk/clerk-react';
import { useClerkAuth } from '../../contexts/ClerkAuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { isLoaded, dbUser } = useClerkAuth();

  return (
    <header className="header">
      <nav className="nav-container">
        <Link to="/" className="logo">
          ReLire <span className="logo-emoji">📚</span>
        </Link>

        <div className="nav-links">
          <Link to="/books" className="nav-link">Livres</Link>
          <Link to="/listings" className="nav-link">Annonces</Link>
          
          <SignedIn>
            <Link to="/profile" className="nav-link">
              {dbUser ? dbUser.name : 'Profil'}
            </Link>
            <Link to="/listings/new" className="nav-link btn-sell">
              Vendre
            </Link>
          </SignedIn>
        </div>

        <div className="auth-section">
          {!isLoaded ? (
            <div className="auth-loading">...</div>
          ) : (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-auth btn-signin">
                    Se connecter
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-auth btn-signup">
                    S'inscrire
                  </button>
                </SignUpButton>
              </SignedOut>
              
              <SignedIn>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'user-avatar',
                    }
                  }}
                />
                {dbUser?.role === 'ADMIN' && (
                  <Link to="/admin" className="admin-badge">
                    Admin
                  </Link>
                )}
              </SignedIn>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;