import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { BookCardProps } from '../../types';
import './BookCard.css';

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  return (
    <div className="book-card">
      <div className="book-cover">
        <img 
          src={imageError ? 'https://via.placeholder.com/240x210/d9e2d2/546c45?text=Livre' : (book.coverImage || 'https://via.placeholder.com/240x210/d9e2d2/546c45?text=Livre')} 
          alt={book.title}
          onError={handleImageError}
        />
      </div>
      <div className="book-info">
        <h3 title={book.title}>{book.title}</h3>
        <p className="author">par {book.author}</p>
        <p className="category">{book.category}</p>
        {book.ageRange && <p className="age">Âge: {book.ageRange}</p>}
        <p className="listings">
          {book._count?.listings || 0} annonce(s)
        </p>
        <Link 
          to={`/books/${book.id}`} 
          className="btn-details"
          onClick={(e) => e.stopPropagation()}
        >
          Voir détails
        </Link>
      </div>
    </div>
  );
};

export default React.memo(BookCard);