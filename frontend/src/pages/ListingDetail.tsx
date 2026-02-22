import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { ListingDetails } from "../types";
import "./ListingDetail.css";

const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadListingDetails(parseInt(id));
    }
  }, [id]);

  const loadListingDetails = async (listingId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getListingById(listingId);
      setListing(data);
    } catch (err) {
      console.error("Erreur chargement annonce:", err);
      setError("Impossible de charger les détails de l'annonce.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="listing-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="listing-detail-page">
        <div className="error-container">
          <h2>Annonce introuvable</h2>
          <p>{error || "Cette annonce n'existe pas."}</p>
          <Link to="/listings" className="btn-back">
            Retour aux annonces
          </Link>
        </div>
      </div>
    );
  }

  const getConditionLabel = (condition: string): string => {
    const labels: Record<string, string> = {
      'NEW': 'Neuf',
      'VERY_GOOD': 'Très bon état',
      'GOOD': 'Bon état',
      'ACCEPTABLE': 'État correct'
    };
    return labels[condition] || condition;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'ACTIVE': 'Disponible',
      'RESERVED': 'Réservé',
      'SOLD': 'Vendu',
      'ARCHIVED': 'Archivé'
    };
    return labels[status] || status;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(price);
  };

  return (
    <div className="listing-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link>
        <span> / </span>
        <Link to="/listings">Annonces</Link>
        <span> / </span>
        <span>{listing.book.title}</span>
      </nav>

      <div className="listing-detail-container">
        {/* Livre associé */}
        <div className="book-section">
          <div className="book-cover-container">
            <img
              src={listing.book.coverImage || '/default-book.jpg'}
              alt={listing.book.title}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-book.jpg';
              }}
            />
          </div>
          <div className="book-info-section">
            <h1>{listing.book.title}</h1>
            <p className="book-author">par {listing.book.author}</p>
            <button 
              className="btn-view-book"
              onClick={() => navigate(`/books/${listing.book.id}`)}
            >
              Voir tous les détails du livre
            </button>
          </div>
        </div>

        {/* Détails de l'annonce */}
        <div className="listing-details-section">
          <div className="price-status-bar">
            <span className="price-large">{formatPrice(listing.price)}</span>
            <span className={`status-badge status-${listing.status.toLowerCase()}`}>
              {getStatusLabel(listing.status)}
            </span>
          </div>

          <div className="detail-card">
            <h2>Détails de l'annonce</h2>
            
            <div className="detail-row">
              <span className="label">État:</span>
              <span className="value condition-badge">
                {getConditionLabel(listing.condition)}
              </span>
            </div>

            <div className="detail-row">
              <span className="label">Publié le:</span>
              <span className="value">
                {new Date(listing.createdAt).toLocaleDateString('fr-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {listing.description && (
              <div className="description-section">
                <h3>Description du vendeur</h3>
                <p>{listing.description}</p>
              </div>
            )}
          </div>

          {/* Info vendeur */}
          <div className="seller-card">
            <h2>Vendu par</h2>
            
            <div className="seller-info">
              <div className="seller-header">
                <h3>{listing.user.name}</h3>
                <div className="seller-rating">
                  ⭐ {listing.user.rating.toFixed(1)}
                </div>
              </div>

              <div className="seller-details">
                <div className="seller-meta">
                  <span className="badge-usertype">{listing.user.userType}</span>
                  {listing.user.location && (
                    <span className="seller-location">📍 {listing.user.location}</span>
                  )}
                </div>
                <p className="seller-transactions">
                  {listing.user.transactionCount} transaction(s)
                </p>
              </div>
            </div>

            {listing.status === 'ACTIVE' && (
              <div className="action-buttons">
                <button className="btn-contact">
                  Contacter le vendeur
                </button>
                <button className="btn-reserve">
                  Réserver
                </button>
              </div>
            )}

            {listing.status === 'RESERVED' && (
              <p className="status-message reserved">
                Cette annonce est actuellement réservée.
              </p>
            )}

            {listing.status === 'SOLD' && (
              <p className="status-message sold">
                Cette annonce a été vendue.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
