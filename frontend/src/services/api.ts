import axios, { type AxiosInstance } from 'axios';
import type { 
  User, Book, BookDetails, Listing, ListingDetails, Review, 
  BookFilters, ListingFilters, PaginatedResponse,
  CreateListingData, CreateBookData, UpdateUserData, UserStats,
  BooksStats, ListingsStats
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour les requêtes (ajout du token Clerk)
    this.api.interceptors.request.use(
      async (config) => {
        // Le token Clerk est récupéré via le hook useAuth
        // Cette partie sera gérée dynamiquement dans les appels
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour les réponses
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token Clerk invalide ou expiré
          console.error('Session Clerk expirée');
        }
        return Promise.reject(error);
      }
    );
  }

  // Méthode pour configurer le token dynamiquement
  async setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // ========== HEALTH ==========
  async checkHealth(): Promise<{ status: string }> {
    const response = await this.api.get('/');
    return response.data;
  }

  // ========== USERS ==========
  async getUsers(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    const response = await this.api.get('/users', { params: { page, limit } });
    return response.data;
  }

  async getUserById(id: number): Promise<User> {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: number, userData: UpdateUserData): Promise<User> {
    const response = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  async searchUsers(params: { email?: string; clerkId?: string; type?: string; location?: string }): Promise<User[]> {
    const response = await this.api.get('/users/search', { params });
    return response.data?.data ?? response.data;
  }

  async getUserReviews(id: number): Promise<Review[]> {
    const response = await this.api.get(`/users/${id}/reviews`);
    return response.data;
  }

  async getUserStats(id: number): Promise<UserStats> {
    const response = await this.api.get(`/users/${id}/stats`);
    return response.data;
  }

  // ========== BOOKS ==========
  async getBooks(params?: BookFilters): Promise<Book[]> {
    const response = await this.api.get('/books', { params });
    return response.data;
  }

  async getBookById(id: number): Promise<BookDetails> {
    const response = await this.api.get(`/books/${id}`);
    return response.data;
  }

  async createBook(bookData: CreateBookData): Promise<Book> {
    const response = await this.api.post('/books', bookData);
    return response.data;
  }

  async updateBook(id: number, bookData: Partial<Book>): Promise<Book> {
    const response = await this.api.put(`/books/${id}`, bookData);
    return response.data;
  }

  async deleteBook(id: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/books/${id}`);
    return response.data;
  }

  async searchBooks(filters: BookFilters): Promise<Book[]> {
    const response = await this.api.get('/books/search', { params: filters });
    return response.data;
  }

  async getPopularBooks(limit = 10): Promise<{ popularBooks: Book[] }> {
    const response = await this.api.get('/books/popular', { params: { limit } });
    return response.data;
  }

  async getBooksStats(): Promise<BooksStats> {
    const response = await this.api.get('/books/stats/overview');
    return response.data;
  }

  async getBookListings(bookId: number): Promise<Listing[]> {
    const response = await this.api.get(`/books/${bookId}/listings`);
    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.data?.listings)) {
      return response.data.listings;
    }

    return [];
  }

  // ========== LISTINGS ==========
  async getListings(params?: {
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<Listing[]> {
    const response = await this.api.get('/listings', { params });
    return response.data;
  }

  async getListingById(id: number): Promise<ListingDetails> {
    const response = await this.api.get(`/listings/${id}`);
    return response.data;
  }

  async createListing(listingData: CreateListingData): Promise<Listing> {
    const response = await this.api.post('/listings', listingData);
    return response.data;
  }

  async updateListing(id: number, listingData: Partial<Listing>): Promise<Listing> {
    const response = await this.api.put(`/listings/${id}`, listingData);
    return response.data;
  }

  async deleteListing(id: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/listings/${id}`);
    return response.data;
  }

  async searchListings(filters: ListingFilters): Promise<Listing[]> {
    const response = await this.api.get('/listings/search', { params: filters });
    return response.data;
  }

  async getListingsStats(): Promise<ListingsStats> {
    const response = await this.api.get('/listings/stats');
    return response.data;
  }

  async getRecommendedListings(userId: number): Promise<Listing[]> {
    const response = await this.api.get('/listings/recommended', { params: { userId } });
    return response.data;
  }

  async updateListingStatus(id: number, status: string): Promise<Listing> {
    const response = await this.api.patch(`/listings/${id}/status`, { status });
    return response.data;
  }
}

export const api = new ApiService();