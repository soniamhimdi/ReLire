import React from 'react';
import { Link } from 'react-router-dom';
import type { BookCardProps } from '../../types';
import './BookCard.css';

const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(book);
    }
  };

  return (
    <div className="book-card" onClick={handleClick}>
      <div className="book-cover">
        <img 
          src={book.coverImage || '/default-book.jpg'} 
          alt={book.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/default-book.jpg';
          }}
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
        <Link to={`/books/${book.id}`} className="btn-details">
          Voir détails
        </Link>
      </div>
    </div>
  );
};

export default BookCard;