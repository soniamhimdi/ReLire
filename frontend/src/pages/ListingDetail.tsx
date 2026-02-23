import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useClerkAuth } from "../contexts/useClerkAuth";
import type { ListingDetails } from "../types";
import "./ListingDetail.css";

const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { dbUser, getToken } = useClerkAuth();

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

  const handleReserve = async () => {
    if (!listing || !id) return;
    
    try {
      setReserving(true);
      await api.updateListingStatus(parseInt(id), 'RESERVED');
      // Recharger les détails pour obtenir le statut mis à jour
      await loadListingDetails(parseInt(id));
      alert('Livre réservé avec succès !');
    } catch (err) {
      console.error("Erreur lors de la réservation:", err);
      alert("Impossible de réserver ce livre. Veuillez réessayer.");
    } finally {
      setReserving(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!listing || !id) return;

    try {
      setCanceling(true);
      await api.updateListingStatus(parseInt(id), 'ACTIVE');
      await loadListingDetails(parseInt(id));
      alert('Reservation annulee avec succes.');
    } catch (err) {
      console.error("Erreur lors de l'annulation:", err);
      alert("Impossible d'annuler la reservation. Veuillez reessayer.");
    } finally {
      setCanceling(false);
    }
  };

  const handleContact = () => {
    if (listing?.user.email) {
      window.location.href = `mailto:${listing.user.email}?subject=À propos de: ${listing.book.title}`;
    } else {
      alert("Aucune adresse email disponible pour ce vendeur.");
    }
  };

  const handleEdit = () => {
    if (!listing) return;
    navigate(`/listings/${listing.id}/edit`);
  };

  const handleDelete = async () => {
    if (!listing) return;
    if (!window.confirm("Confirmer la suppression de cette annonce ?")) return;

    try {
      setDeleting(true);
      const token = await getToken();
      await api.setAuthToken(token);
      await api.deleteListing(listing.id);
      alert("Annonce supprimée avec succès.");
      navigate("/listings");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Impossible de supprimer cette annonce.");
    } finally {
      setDeleting(false);
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

  const isOwner = dbUser?.id === listing.user.id;
  const isBuyer = dbUser?.id === listing.transaction?.buyer?.id;
  const canCancelReservation = listing.status === 'RESERVED' && (isOwner || isBuyer);
  const canEdit = isOwner && listing.status === 'ACTIVE';

  const fallbackCover = "/default-book.svg";

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
              src={listing.book.coverImage || fallbackCover}
              alt={listing.book.title}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.dataset.fallbackApplied) return;
                target.dataset.fallbackApplied = "true";
                target.src = fallbackCover;
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

            {listing.status === 'ACTIVE' && !isOwner && (
              <div className="action-buttons">
                <button 
                  className="btn-contact"
                  onClick={handleContact}
                >
                  Contacter le vendeur
                </button>
                <button 
                  className="btn-reserve"
                  onClick={handleReserve}
                  disabled={reserving}
                >
                  {reserving ? 'Reservation...' : 'Reserver'}
                </button>
              </div>
            )}

            {isOwner && (
              <div className="owner-actions">
                {canEdit && (
                  <button className="btn-edit" onClick={handleEdit}>
                    Modifier l'annonce
                  </button>
                )}
                <button
                  className="btn-delete"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Suppression..." : "Supprimer l'annonce"}
                </button>
              </div>
            )}

            {listing.status === 'RESERVED' && (
              <div>
                <p className="status-message reserved">
                  Cette annonce est actuellement reservee.
                </p>
                {canCancelReservation && (
                  <button
                    className="btn-cancel-reservation"
                    onClick={handleCancelReservation}
                    disabled={canceling}
                  >
                    {canceling ? 'Annulation...' : 'Annuler la reservation'}
                  </button>
                )}
              </div>
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
