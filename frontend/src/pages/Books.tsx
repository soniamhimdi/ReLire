import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import BookCard from '../components/Books/BookCard';
import BookFilters from '../components/Books/BookFilters';
import type { Book, BookFilters as FiltersType } from '../types';
import './Books.css';

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FiltersType>({});

  const booksPerPage = 12;

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getBooks();
      setBooks(data);
      setFilteredBooks(data);
      setTotalPages(Math.ceil(data.length / booksPerPage));
    } catch (err) {
      setError('Erreur lors du chargement des livres');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback((filters: FiltersType, search?: string) => {
    let filtered = [...books];

    // Filtre par catégorie
    if (filters.category) {
      filtered = filtered.filter(b => b.category === filters.category);
    }

    // Filtre par âge
    if (filters.ageRange) {
      filtered = filtered.filter(b => b.ageRange === filters.ageRange);
    }

    // Filtre par état (si applicable aux livres)
    if (filters.condition) {
      // Logique spécifique si besoin
    }

    // Filtre par recherche textuelle
    const term = search?.toLowerCase() || '';
    if (term) {
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        (b.isbn && b.isbn.includes(term))
      );
    }

    setFilteredBooks(filtered);
    setTotalPages(Math.ceil(filtered.length / booksPerPage));
    setCurrentPage(1);
  }, [books]);

  const handleFilterChange = (filters: FiltersType): void => {
    setActiveFilters(filters);
    applyFilters(filters, searchTerm);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(activeFilters, term);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCurrentPageBooks = (): Book[] => {
    const start = (currentPage - 1) * booksPerPage;
    const end = start + booksPerPage;
    return filteredBooks.slice(start, end);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement du catalogue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchBooks} className="btn-retry">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="books-page">
      <div className="page-header">
        <h1>Catalogue des livres</h1>
        <p className="page-description">
          Découvrez notre sélection de livres d'occasion pour tous les âges
        </p>
      </div>
      
      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher par titre, auteur ou ISBN..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="books-container">
        <aside className="filters-sidebar">
          <BookFilters 
            onFilterChange={handleFilterChange} 
            initialFilters={activeFilters}
          />
        </aside>

        <main className="books-content">
          <div className="results-header">
            <p className="results-count">
              {filteredBooks.length} livre(s) trouvé(s)
            </p>
            {activeFilters && Object.keys(activeFilters).length > 0 && (
              <p className="active-filters">
                Filtres actifs: {Object.keys(activeFilters).length}
              </p>
            )}
          </div>

          {filteredBooks.length > 0 ? (
            <>
              <div className="books-grid">
                {getCurrentPageBooks().map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    ← Précédent
                  </button>
                  
                  <span className="pagination-info">
                    Page {currentPage} sur {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <p>Aucun livre ne correspond à votre recherche</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilters({});
                  handleFilterChange({});
                }} 
                className="btn-primary"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Books;