import React from 'react';
import { Link } from 'react-router-dom';
import type { ListingCardProps } from '../../types';
import './ListingCard.css';

const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect }) => {
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

  const handleClick = () => {
    if (onSelect) {
      onSelect(listing);
    }
  };

  return (
    <div className="listing-card" onClick={handleClick}>
      <div className="listing-header">
        <h3>{listing.book.title}</h3>
        <span className={`status status-${listing.status.toLowerCase()}`}>
          {getStatusLabel(listing.status)}
        </span>
      </div>
      
      <p className="book-author">par {listing.book.author}</p>
      
      <div className="listing-details">
        <p className="price">{formatPrice(listing.price)}</p>
        <p className="condition">{getConditionLabel(listing.condition)}</p>
      </div>
      
      <div className="seller-info">
        <p className="seller-name">{listing.user.name}</p>
        <p className="seller-rating">⭐ {listing.user.rating.toFixed(1)}</p>
        {listing.user.location && (
          <p className="seller-location">📍 {listing.user.location}</p>
        )}
      </div>
      
      <Link to={`/listings/${listing.id}`} className="btn-view">
        Voir l'annonce
      </Link>
    </div>
  );
};

export default ListingCard;