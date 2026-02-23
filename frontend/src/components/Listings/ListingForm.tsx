import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import type { Book } from '../../types';
import { useClerkAuth } from '../../contexts/useClerkAuth';
import './ListingForm.css';

const ListingForm: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, dbUser, syncUserWithDatabase, getToken } = useClerkAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    bookId: '',
    price: '',
    condition: 'GOOD' as 'NEW' | 'VERY_GOOD' | 'GOOD' | 'ACCEPTABLE',
    description: '',
  });

  const [bookSearch, setBookSearch] = useState({
    title: '',
    author: '',
    isbn: '',
  });

  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'EDUCATIONAL' as 'EDUCATIONAL' | 'CHILDREN' | 'TEXTBOOK' | 'NOVEL' | 'COMIC' | 'NON_FICTION',
    ageRange: '',
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setSearchLoading(true);
      const data = await api.getBooks();
      setBooks(data);
      setSearchResults(data);
    } catch (err) {
      console.error('Erreur chargement livres:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookSearch(prev => ({ ...prev, [name]: value }));
  };

  const searchBooks = () => {
    const filtered = books.filter(book => {
      const matchTitle = !bookSearch.title || 
        book.title.toLowerCase().includes(bookSearch.title.toLowerCase());
      const matchAuthor = !bookSearch.author || 
        book.author.toLowerCase().includes(bookSearch.author.toLowerCase());
      const matchIsbn = !bookSearch.isbn || 
        (book.isbn && book.isbn.includes(bookSearch.isbn));
      
      return matchTitle && matchAuthor && matchIsbn;
    });
    
    setSearchResults(filtered);
    setShowCreateBook(filtered.length === 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewBookChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: value }));
  };

  const selectBook = (bookId: number) => {
    setFormData(prev => ({ ...prev, bookId: String(bookId) }));
    setShowCreateBook(false);
  };

  const createNewBook = async () => {
    try {
      setLoading(true);
      const createdBook = await api.createBook(newBook);
      setBooks(prev => [...prev, createdBook]);
      setSearchResults(prev => [createdBook, ...prev]);
      setFormData(prev => ({ ...prev, bookId: String(createdBook.id) }));
      setShowCreateBook(false);
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        category: 'EDUCATIONAL',
        ageRange: '',
      });
    } catch (err) {
      setError('Erreur lors de la création du livre');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      setError("Veuillez vous connecter pour créer une annonce");
      return;
    }

    if (!formData.bookId) {
      setError('Veuillez sélectionner ou créer un livre');
      return;
    }

    if (!formData.price || Number.isNaN(parseFloat(formData.price))) {
      setError('Veuillez entrer un prix valide');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      await api.setAuthToken(token);

      let resolvedUser = dbUser;
      if (!resolvedUser) {
        console.log('Synchronisation de l\'utilisateur...');
        resolvedUser = await syncUserWithDatabase();
      }

      if (!resolvedUser) {
        setError("Profil utilisateur introuvable. Veuillez réessayer ou vous reconnecter.");
        setLoading(false);
        return;
      }

      console.log('Création de l\'annonce avec userId:', resolvedUser.id);
      
      const listingData = {
        userId: resolvedUser.id,
        bookId: parseInt(formData.bookId),
        price: parseFloat(formData.price),
        condition: formData.condition,
        description: formData.description,
      };

      console.log('Données à envoyer:', listingData);
      
      const result = await api.createListing(listingData);
      
      if (!result || !result.id) {
        throw new Error("L'annonce n'a pas été créée correctement");
      }
      
      console.log('✅ Annonce créée avec succès:', result);
      alert('Annonce créée avec succès !');
      navigate('/listings');
    } catch (err: unknown) {
      console.error('❌ Erreur complète:', err);
      let message = "Erreur lors de la création de l'annonce";
      if (err && typeof err === 'object') {
        const response = (err as { response?: { data?: { error?: string }, status?: number } }).response;
        if (response?.status === 401) {
          message = "Authentification échouée. Veuillez vous reconnecter.";
        } else if (response?.data?.error) {
          message = response.data.error;
        } else if ((err as Error).message) {
          message = (err as Error).message;
        }
      }
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedBook = books.find(b => b.id === parseInt(formData.bookId));

  // Si l'utilisateur n'est pas connecté, afficher un message
  if (!isSignedIn) {
    return (
      <div className="listing-form-page">
        <div className="form-container">
          <div className="error-message">
            <h2>Connexion requise</h2>
            <p>Vous devez être connecté pour créer une annonce.</p>
            <p>Veuillez vous connecter via Clerk en haut de la page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="listing-form-page">
      <div className="form-container">
        <h1>Créer une annonce</h1>
        
        {!dbUser && (
          <div className="warning-message">
            ⚠️ Synchronisation du profil en cours...
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="listing-form">
          
          {/* Section 1: Recherche ou création de livre */}
          <section className="form-section">
            <h2>1. Sélectionner le livre</h2>
            
            <div className="book-search">
              <div className="search-inputs">
                <input
                  type="text"
                  name="title"
                  placeholder="Titre du livre"
                  value={bookSearch.title}
                  onChange={handleSearchChange}
                />
                <input
                  type="text"
                  name="author"
                  placeholder="Auteur"
                  value={bookSearch.author}
                  onChange={handleSearchChange}
                />
                <input
                  type="text"
                  name="isbn"
                  placeholder="ISBN (optionnel)"
                  value={bookSearch.isbn}
                  onChange={handleSearchChange}
                />
                <button 
                  type="button" 
                  onClick={searchBooks}
                  className="btn-search"
                  disabled={searchLoading}
                >
                  Rechercher
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  <h3>Résultats ({searchResults.length})</h3>
                  <div className="books-list">
                    {searchResults.map(book => (
                      <div 
                        key={book.id}
                        className={`book-item ${formData.bookId === String(book.id) ? 'selected' : ''}`}
                        onClick={() => selectBook(book.id)}
                      >
                        <h4>{book.title}</h4>
                        <p>par {book.author}</p>
                        <span className="category-badge">{book.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showCreateBook && (
                <div className="create-book-section">
                  <h3>Livre introuvable ? Créez-le</h3>
                  <div className="new-book-form">
                    <input
                      type="text"
                      name="title"
                      placeholder="Titre *"
                      value={newBook.title}
                      onChange={handleNewBookChange}
                      required
                    />
                    <input
                      type="text"
                      name="author"
                      placeholder="Auteur *"
                      value={newBook.author}
                      onChange={handleNewBookChange}
                      required
                    />
                    <input
                      type="text"
                      name="isbn"
                      placeholder="ISBN (optionnel)"
                      value={newBook.isbn}
                      onChange={handleNewBookChange}
                    />
                    <select
                      name="category"
                      value={newBook.category}
                      onChange={handleNewBookChange}
                      required
                    >
                      <option value="EDUCATIONAL">Éducatif</option>
                      <option value="CHILDREN">Jeunesse</option>
                      <option value="TEXTBOOK">Manuel scolaire</option>
                      <option value="NOVEL">Roman</option>
                      <option value="COMIC">Bande dessinée</option>
                      <option value="NON_FICTION">Documentaire</option>
                    </select>
                    <input
                      type="text"
                      name="ageRange"
                      placeholder="Tranche d'âge (ex: 6-8)"
                      value={newBook.ageRange}
                      onChange={handleNewBookChange}
                    />
                    <button 
                      type="button" 
                      onClick={createNewBook}
                      className="btn-create-book"
                      disabled={!newBook.title || !newBook.author || loading}
                    >
                      Créer ce livre
                    </button>
                  </div>
                </div>
              )}

              {selectedBook && (
                <div className="selected-book">
                  <h3>Livre sélectionné ✓</h3>
                  <div className="book-details">
                    <h4>{selectedBook.title}</h4>
                    <p>par {selectedBook.author}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Détails de l'annonce */}
          <section className="form-section">
            <h2>2. Détails de l'annonce</h2>
            
            <div className="form-group">
              <label htmlFor="price">Prix (CAD) *</label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="condition">État *</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                required
              >
                <option value="NEW">Neuf</option>
                <option value="VERY_GOOD">Très bon état</option>
                <option value="GOOD">Bon état</option>
                <option value="ACCEPTABLE">État correct</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Décrivez l'état du livre, ajoutez des informations supplémentaires..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </section>

          {/* Boutons */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/listings')}
              className="btn-cancel"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Publier l\'annonce'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingForm;
