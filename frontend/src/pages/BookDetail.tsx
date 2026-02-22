import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import ListingCard from "../components/Listings/ListingCard";
import type { BookDetails, Listing } from "../types";
import "./BookDetail.css";

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBookDetails(parseInt(id));
    }
  }, [id]);

  const loadBookDetails = async (bookId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const [bookData, listingsData] = await Promise.all([
        api.getBookById(bookId),
        api.getBookListings(bookId).catch(() => []),
      ]);

      setBook(bookData);
      setListings(Array.isArray(listingsData) ? listingsData : []);
    } catch (err) {
      console.error("Erreur chargement livre:", err);
      setError("Impossible de charger les détails du livre.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-detail-page">
        <div className="error-container">
          <h2>Livre introuvable</h2>
          <p>{error || "Ce livre n'existe pas."}</p>
          <Link to="/books" className="btn-back">
            Retour aux livres
          </Link>
        </div>
      </div>
    );
  }

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'EDUCATIONAL': 'Éducatif',
      'CHILDREN': 'Jeunesse',
      'TEXTBOOK': 'Manuel scolaire',
      'NOVEL': 'Roman',
      'COMIC': 'Bande dessinée',
      'NON_FICTION': 'Non-fiction',
      'OTHER': 'Autre'
    };
    return labels[category] || category;
  };

  return (
    <div className="book-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link>
        <span> / </span>
        <Link to="/books">Livres</Link>
        <span> / </span>
        <span>{book.title}</span>
      </nav>

      {/* Détails du livre */}
      <div className="book-detail-header">
        <div className="book-cover-large">
          <img
            src={book.coverImage || '/default-book.jpg'}
            alt={book.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-book.jpg';
            }}
          />
        </div>
        
        <div className="book-info-main">
          <h1>{book.title}</h1>
          <p className="book-author">par {book.author}</p>
          
          <div className="book-meta">
            <span className="meta-item">
              <strong>Catégorie:</strong> {getCategoryLabel(book.category)}
            </span>
            {book.isbn && (
              <span className="meta-item">
                <strong>ISBN:</strong> {book.isbn}
              </span>
            )}
            {book.language && (
              <span className="meta-item">
                <strong>Langue:</strong> {book.language}
              </span>
            )}
            {book.ageRange && (
              <span className="meta-item">
                <strong>Âge:</strong> {book.ageRange}
              </span>
            )}
            {book.schoolLevel && (
              <span className="meta-item">
                <strong>Niveau:</strong> {book.schoolLevel}
              </span>
            )}
          </div>

          {book.description && (
            <div className="book-description">
              <h3>Description</h3>
              <p>{book.description}</p>
            </div>
          )}

          <div className="book-stats">
            <div className="stat-item">
              <span className="stat-number">{listings.length}</span>
              <span className="stat-label">Annonce(s) disponible(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Annonces disponibles */}
      <section className="listings-section">
        <h2>Annonces disponibles pour ce livre</h2>
        
        {listings.length > 0 ? (
          <div className="listings-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Aucune annonce disponible pour ce livre actuellement.</p>
            <p className="empty-hint">
              Soyez le premier à vendre ce livre !
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default BookDetailPage;
