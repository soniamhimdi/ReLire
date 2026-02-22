import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import ListingCard from "../components/Listings/ListingCard";
import type { Listing } from "../types";
import "./Listing.css";

interface ListingPageFilters {
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

const ListingsPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListingPageFilters>({
    status: 'ACTIVE',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadListings();
  }, [filters]);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getListings({
        status: filters.status as string,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        page: 1,
        limit: 20,
      });
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement annonces:", err);
      setError("Impossible de charger les annonces.");
    } finally {
      setLoading(false);
    }
  };

  const handleListingSelect = (listing: Listing) => {
    navigate(`/listings/${listing.id}`);
  };

  if (error) {
    return (
      <div className="listings-page">
        <div className="error-container">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button className="btn-retry" onClick={loadListings}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="listings-page">
      <div className="page-header">
        <h1>Toutes les annonces</h1>
        <p className="subtitle">
          Parcourez les {listings.length} annonces disponibles
        </p>
      </div>

      {/* Filtres */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="status">Statut:</label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as any })
            }
          >
            <option value="">Tous</option>
            <option value="ACTIVE">Actif</option>
            <option value="RESERVED">Réservé</option>
            <option value="SOLD">Vendu</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="minPrice">Prix min:</label>
          <input
            id="minPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={filters.minPrice || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxPrice">Prix max:</label>
          <input
            id="maxPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="100.00"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
          />
        </div>

        <button className="btn-reset" onClick={() => setFilters({ status: 'ACTIVE' })}>
          Réinitialiser
        </button>
      </div>

      {/* Grille d'annonces */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des annonces...</p>
        </div>
      ) : listings.length > 0 ? (
        <div className="listings-grid">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSelect={handleListingSelect}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Aucune annonce trouvée avec ces filtres.</p>
        </div>
      )}
    </div>
  );
};

export default ListingsPage;