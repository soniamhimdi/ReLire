import { useEffect, useState } from "react";
import { useClerkAuth } from "../contexts/useClerkAuth";
import { api } from "../services/api";
import type { UserStats, Listing } from "../types";
import ListingCard from "../components/Listings/ListingCard";
import "./Profile.css";

const ProfilePage = () => {
  const { dbUser, user: clerkUser, isLoaded } = useClerkAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "listings" | "stats">("info");

  useEffect(() => {
    if (isLoaded && dbUser) {
      loadProfileData();
    }
  }, [isLoaded, dbUser]);

  const loadProfileData = async () => {
    if (!dbUser) return;

    try {
      setLoading(true);
      
      // Charger les stats et les annonces de l'utilisateur
      const [userStats, listings] = await Promise.all([
        api.getUserStats(dbUser.id).catch(() => null),
        api.getListings({ limit: 50 }).catch(() => []),
      ]);

      setStats(userStats);
      
      // Filtrer les annonces de l'utilisateur
      const myListings = Array.isArray(listings)
        ? listings.filter(l => l.user.id === dbUser.id)
        : [];
      setUserListings(myListings);
    } catch (err) {
      console.error("Erreur chargement profil:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!dbUser || !clerkUser) {
    return (
      <div className="profile-page">
        <div className="error-container">
          <h2>Non connecté</h2>
          <p>Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* En-tête du profil */}
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={clerkUser.imageUrl} alt={dbUser.name} />
        </div>
        <div className="profile-info">
          <h1>{dbUser.name}</h1>
          <p className="user-email">{dbUser.email}</p>
          <div className="user-badges">
            <span className="badge badge-type">{dbUser.userType}</span>
            <span className="badge badge-role">{dbUser.role}</span>
          </div>
          {dbUser.location && (
            <p className="user-location">📍 {dbUser.location}</p>
          )}
          <div className="user-rating">
            ⭐ {dbUser.rating.toFixed(1)} ({dbUser.transactionCount} transactions)
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Informations
        </button>
        <button
          className={`tab ${activeTab === "listings" ? "active" : ""}`}
          onClick={() => setActiveTab("listings")}
        >
          Mes annonces ({userListings.length})
        </button>
        <button
          className={`tab ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          Statistiques
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {activeTab === "info" && (
          <div className="info-section">
            <div className="info-card">
              <h3>Informations du compte</h3>
              <div className="info-row">
                <span className="label">Nom:</span>
                <span className="value">{dbUser.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{dbUser.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Type d'utilisateur:</span>
                <span className="value">{dbUser.userType}</span>
              </div>
              <div className="info-row">
                <span className="label">Rôle:</span>
                <span className="value">{dbUser.role}</span>
              </div>
              <div className="info-row">
                <span className="label">Localisation:</span>
                <span className="value">{dbUser.location || "Non renseignée"}</span>
              </div>
              <div className="info-row">
                <span className="label">Membre depuis:</span>
                <span className="value">
                  {new Date(dbUser.createdAt).toLocaleDateString("fr-CA")}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "listings" && (
          <div className="listings-section">
            {userListings.length > 0 ? (
              <div className="listings-grid">
                {userListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Vous n'avez pas encore d'annonces.</p>
                <button className="btn-primary">Créer une annonce</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="stats-section">
            {stats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{stats.totalListings}</h3>
                  <p>Annonces créées</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalPurchases}</h3>
                  <p>Achats</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalSales}</h3>
                  <p>Ventes</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalTransactions}</h3>
                  <p>Total transactions</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.averageRating.toFixed(1)}</h3>
                  <p>Note moyenne</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalReviews}</h3>
                  <p>Avis reçus</p>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>Statistiques non disponibles.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;