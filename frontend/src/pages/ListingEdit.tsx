import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { useClerkAuth } from "../contexts/useClerkAuth";
import type { Condition, ListingDetails } from "../types";
import "../components/Listings/ListingForm.css";

const ListingEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSignedIn, dbUser, getToken } = useClerkAuth();

  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    price: "",
    condition: "GOOD" as Condition,
    description: "",
  });

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
      setFormData({
        price: String(data.price),
        condition: data.condition,
        description: data.description ?? "",
      });
    } catch (err) {
      console.error("Erreur chargement annonce:", err);
      setError("Impossible de charger l'annonce.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!listing) return;

    if (!dbUser || dbUser.id !== listing.user.id) {
      setError("Vous n'etes pas autorise a modifier cette annonce.");
      return;
    }

    if (listing.status !== "ACTIVE") {
      setError("Cette annonce n'est plus modifiable.");
      return;
    }

    const price = parseFloat(formData.price);
    if (!formData.price || Number.isNaN(price)) {
      setError("Veuillez entrer un prix valide.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const token = await getToken();
      await api.setAuthToken(token);

      await api.updateListing(listing.id, {
        price,
        condition: formData.condition,
        description: formData.description || undefined,
      });

      alert("Annonce mise a jour avec succes.");
      navigate(`/listings/${listing.id}`);
    } catch (err) {
      console.error("Erreur mise a jour annonce:", err);
      setError("Erreur lors de la mise a jour de l'annonce.");
    } finally {
      setSaving(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="listing-form-page">
        <div className="form-container">
          <div className="error-message">
            <h2>Connexion requise</h2>
            <p>Vous devez etre connecte pour modifier une annonce.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="listing-form-page">
        <div className="form-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="listing-form-page">
        <div className="form-container">
          <div className="error-message">
            <h2>Modification impossible</h2>
            <p>{error || "Annonce introuvable."}</p>
            <Link to={"/listings"} className="btn-cancel">
              Retour aux annonces
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = dbUser?.id === listing.user.id;
  const canEdit = isOwner && listing.status === "ACTIVE";

  if (!canEdit) {
    return (
      <div className="listing-form-page">
        <div className="form-container">
          <div className="error-message">
            <h2>Acces refuse</h2>
            <p>
              {isOwner
                ? "Cette annonce n'est plus modifiable."
                : "Vous ne pouvez pas modifier cette annonce."}
            </p>
            <Link to={`/listings/${listing.id}`} className="btn-cancel">
              Retour a l'annonce
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="listing-form-page">
      <div className="form-container">
        <h1>Modifier l'annonce</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="listing-form">
          <section className="form-section">
            <h2>1. Livre associe</h2>
            <div className="selected-book">
              <div className="book-details">
                <h4>{listing.book.title}</h4>
                <p>par {listing.book.author}</p>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>2. Details de l'annonce</h2>

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
              <label htmlFor="condition">Etat *</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                required
              >
                <option value="NEW">Neuf</option>
                <option value="VERY_GOOD">Tres bon etat</option>
                <option value="GOOD">Bon etat</option>
                <option value="ACCEPTABLE">Etat correct</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Decrivez l'etat du livre, ajoutez des informations supplementaires..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </section>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/listings/${listing.id}`)}
              className="btn-cancel"
            >
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? "Mise a jour..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingEditPage;
