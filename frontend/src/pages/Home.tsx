import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import BookCard from '../components/Books/BookCard';
import type { Book, Listing, BooksStats } from '../types';
import './Home.css';

const Home: React.FC = () => {
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<BooksStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        const [booksData, listingsData, bookStats] = await Promise.all([
          api.getPopularBooks(6),
          api.getListings({ status: 'ACTIVE' }),
          api.getBooksStats(),
        ]);
        
        setPopularBooks(booksData.popularBooks || []);
        setRecentListings(listingsData.slice(0, 6));
        setStats(bookStats);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur chargement:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement de ReLire...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-retry">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>ReLire <span className="emoji">📚</span></h1>
          <p className="hero-tagline">Donnez une seconde vie à vos livres</p>
          <p className="hero-description">
            La marketplace québécoise dédiée aux livres d'occasion pour toute la famille
          </p>
          <div className="hero-buttons">
            <Link to="/books" className="btn-primary btn-large">
              Parcourir les livres
            </Link>
            <Link to="/listings/new" className="btn-secondary btn-large">
              Vendre un livre
            </Link>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      {stats && (
        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <h3>{stats.totalBooks || 0}</h3>
              <p>Livres dans le catalogue</p>
            </div>
            <div className="stat-item">
              <h3>{stats.totalListings || 0}</h3>
              <p>Annonces actives</p>
            </div>
            <div className="stat-item">
              <h3>{recentListings.length}</h3>
              <p>Annonces récentes</p>
            </div>
            <div className="stat-item">
              <h3>⭐ 4.8</h3>
              <p>Note moyenne</p>
            </div>
          </div>
        </section>
      )}

      {/* Livres populaires */}
      <section className="popular-books">
        <div className="section-header">
          <h2>Livres les plus recherchés</h2>
          <Link to="/books" className="view-all">
            Voir tout →
          </Link>
        </div>
        
        {popularBooks.length > 0 ? (
          <div className="books-grid">
            {popularBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <p className="no-data">Aucun livre populaire pour le moment</p>
        )}
      </section>

      {/* Annonces récentes */}
      <section className="recent-listings">
        <div className="section-header">
          <h2>Dernières annonces</h2>
          <Link to="/listings" className="view-all">
            Voir tout →
          </Link>
        </div>
        
        {recentListings.length > 0 ? (
          <div className="listings-preview">
            {recentListings.map(listing => (
              <div key={listing.id} className="listing-preview-card">
                <h3>{listing.book?.title}</h3>
                <p className="book-author">{listing.book?.author}</p>
                <div className="preview-details">
                  <span className="price">{listing.price}$</span>
                  <span className="condition">{listing.condition}</span>
                </div>
                <p className="seller">Vendeur: {listing.user?.name}</p>
                <Link to={`/listings/${listing.id}`} className="btn-small">
                  Voir l'annonce
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Aucune annonce récente</p>
        )}
      </section>

      {/* Appel à l'action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt à rejoindre la communauté ?</h2>
          <p>Des milliers de livres n'attendent que vous</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-primary btn-large">
              S'inscrire gratuitement
            </Link>
            <Link to="/about" className="btn-outline btn-large">
              En savoir plus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;