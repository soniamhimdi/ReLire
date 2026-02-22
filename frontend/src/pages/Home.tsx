import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import BookCard from "../components/Books/BookCard";
import type { Book, Listing } from "../types";
import "./Home.css";

const Home = () => {
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les données en parallèle
      const [booksRes, listingsRes] = await Promise.all([
        api.getPopularBooks(6).catch(() => ({ popularBooks: [] })),
        api.getListings({ status: 'ACTIVE', limit: 6 }).catch(() => []),
      ]);

      setPopularBooks(booksRes.popularBooks || []);
      setRecentListings(Array.isArray(listingsRes) ? listingsRes : []);
    } catch (err) {
      console.error("Erreur chargement données:", err);
      setError("Impossible de charger les données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <div className="error-container">
          <h2>Oups !</h2>
          <p>{error}</p>
          <button className="btn-retry" onClick={loadHomeData}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Section Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Lire, Relire, Partager</h1>
          <p className="hero-description">
            ReLire est la première marketplace québécoise dédiée à l'échange de livres d'occasion entre particuliers. 
            Conçue pour le milieu éducatif, ouverte à tous les passionnés de lecture.
          </p>
          <div className="hero-buttons">
            <Link to="/books" className="btn-primary btn-large">
              Trouver un livre
            </Link>
            <Link to="/listings" className="btn-secondary btn-large">
              Voir les annonces
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="book-icon">📚</div>
          <h3>Économisez jusqu'à 70%</h3>
          <p>Sur vos livres éducatifs et jeunesse</p>
        </div>
      </section>

      {/* Section Pourquoi choisir ReLire */}
      <section className="features-section">
        <h2>Pourquoi choisir ReLire ?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Spécialisation Éducative</h3>
            <p>
              Filtres pédagogiques, recherche par niveau scolaire, alignement avec programmes québécois.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Communauté de Confiance</h3>
            <p>
              Système de notation, profils vérifiés, échanges locaux sécurisés entre particuliers.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Économie Circulaire</h3>
            <p>
              Prolongez la vie des livres, réduisez le gaspillage, participez à une consommation responsable.
            </p>
          </div>
        </div>
      </section>

      {/* Section Types d'utilisateurs */}
      <section className="user-types-section">
        <h2>Conçu pour chaque lecteur</h2>
        <div className="user-cards">
          <div className="user-card">
            <div className="user-avatar">👩‍🏫</div>
            <h3>Enseignants</h3>
            <p>Matériel pédagogique abordable pour votre classe</p>
          </div>
          <div className="user-card">
            <div className="user-avatar">👨‍👩‍👧‍👦</div>
            <h3>Parents</h3>
            <p>Livres jeunesse pour tous les âges et tous les budgets</p>
          </div>
          <div className="user-card">
            <div className="user-avatar">🎓</div>
            <h3>Étudiants</h3>
            <p>Manuels académiques à prix réduits</p>
          </div>
          <div className="user-card">
            <div className="user-avatar">📖</div>
            <h3>Lecteurs Passionnés</h3>
            <p>Découvrez, échangez, partagez votre passion</p>
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <h3>500+</h3>
            <p>Livres disponibles</p>
          </div>
          <div className="stat-item">
            <h3>200+</h3>
            <p>Membres actifs</p>
          </div>
          <div className="stat-item">
            <h3>85%</h3>
            <p>Économie moyenne</p>
          </div>
          <div className="stat-item">
            <h3>4.8★</h3>
            <p>Satisfaction utilisateurs</p>
          </div>
        </div>
      </section>

      {/* Section Livres Populaires */}
      <section className="popular-books">
        <div className="section-header">
          <h2>Livres populaires</h2>
          <Link to="/books" className="view-all">
            Voir tout →
          </Link>
        </div>
        {popularBooks.length > 0 ? (
          <div className="books-grid">
            {popularBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <p className="no-data">Aucun livre disponible pour le moment.</p>
        )}
      </section>

      {/* Section Annonces Récentes */}
      <section className="recent-listings">
        <div className="section-header">
          <h2>Annonces récentes</h2>
          <Link to="/listings" className="view-all">
            Voir tout →
          </Link>
        </div>
        {recentListings.length > 0 ? (
          <div className="listings-preview">
            {recentListings.map((listing) => (
              <div key={listing.id} className="listing-preview-card">
                <h3>{listing.book.title}</h3>
                <p className="book-author">par {listing.book.author}</p>
                <div className="preview-details">
                  <span>{listing.price.toFixed(2)} $</span>
                  <span>•</span>
                  <span>{listing.condition}</span>
                </div>
                <p className="seller">Vendeur: {listing.user.name}</p>
                <Link to={`/listings/${listing.id}`} className="btn-small">
                  Voir détails
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Aucune annonce disponible pour le moment.</p>
        )}
      </section>

      {/* Section Call-to-Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt à commencer ?</h2>
          <p>
            Rejoignez notre communauté et donnez une seconde vie à vos livres !
          </p>
          <div className="cta-buttons">
            <Link to="/listings/new" className="btn-primary btn-large">
              Publier une annonce
            </Link>
            <Link to="/books" className="btn-secondary btn-large">
              Parcourir les livres
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;