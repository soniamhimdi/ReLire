
////////////////////////////
// Types correspondant au backend avec intégration Clerk
export type UserType = 'TEACHER' | 'PARENT' | 'STUDENT' | 'READER' | 'GENERAL';
export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export type BookCategory = 
  | 'EDUCATIONAL' 
  | 'CHILDREN' 
  | 'TEXTBOOK' 
  | 'NOVEL' 
  | 'COMIC' 
  | 'NON_FICTION' 
  | 'OTHER';

export type Condition = 'NEW' | 'VERY_GOOD' | 'GOOD' | 'ACCEPTABLE';
export type ListingStatus = 'ACTIVE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

// Interface pour l'utilisateur Clerk
export interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
  imageUrl: string;
}

// Interface pour notre utilisateur en base
export interface User {
  id: number;
  clerkId: string;  // ID Clerk pour liaison
  email: string;
  name: string;
  userType: UserType;
  role: UserRole;
  location?: string;
  rating: number;
  transactionCount?: number;  // Optionnel car pas retourné par tous les endpoints
  createdAt: string;
}

export interface UserStats {
  totalListings: number;
  totalPurchases: number;
  totalSales: number;
  totalTransactions: number;
  averageRating: number;
  totalReviews: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  category: BookCategory;
  ageRange?: string;
  schoolLevel?: string;
  language: string;
  coverImage?: string;
  description?: string;
  _count?: {
    listings: number;
  };
}

export interface BookDetails extends Book {
  listings: Listing[];
}

export interface Listing {
  id: number;
  price: number;
  condition: Condition;
  status: ListingStatus;
  description?: string;
  createdAt: string;
  user: {
    id: number;
    clerkId: string;
    name: string;
    userType: UserType;
    rating: number;
    location?: string;
  };
  book: {
    id: number;
    title: string;
    author: string;
    category: BookCategory;
    ageRange?: string;
  };
}

export interface ListingDetails extends Listing {
  user: User;
  book: Book;
  transaction?: {
    id: number;
    status: TransactionStatus;
    buyer: { name: string };
  };
}

export interface Transaction {
  id: number;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  buyerId: number;
  sellerId: number;
  listingId: number;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: {
    name: string;
    userType: UserType;
  };
  reviewee?: {
    name: string;
  };
  transaction?: {
    listing: {
      book: { title: string };
    };
  };
}

// Types pour les filtres
export interface BookFilters {
  category?: BookCategory;
  ageRange?: string;
  schoolLevel?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface ListingFilters {
  type?: BookCategory;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  userType?: UserType;
  minRating?: number;
  sortBy?: 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Types pour les réponses paginées
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les props des composants
export interface BookCardProps {
  book: Book;
  onSelect?: (book: Book) => void;
}

export interface ListingCardProps {
  listing: Listing;
  onSelect?: (listing: Listing) => void;
}

export interface BookFiltersProps {
  onFilterChange: (filters: BookFilters) => void;
  initialFilters?: BookFilters;
}

// Types pour les formulaires
export interface CreateListingData {
  userId: number;
  bookId: number;
  price: number;
  condition: Condition;
  description?: string;
}

export interface CreateBookData {
  title: string;
  author: string;
  isbn?: string;
  category: BookCategory;
  ageRange?: string;
  schoolLevel?: string;
  language?: string;
}

export interface UpdateUserData {
  name?: string;
  location?: string;
  userType?: UserType;
}

// Stats interfaces
export interface BooksStats {
  totalBooks?: number;
  totalListings?: number;
  averagePrice?: number;
  popularCategories?: Array<{ category: string; count: number }>;
}

export interface ListingsStats {
  totalListings?: number;
  activeListings?: number;
  soldListings?: number;
  averagePrice?: number;
  totalRevenue?: number;
}