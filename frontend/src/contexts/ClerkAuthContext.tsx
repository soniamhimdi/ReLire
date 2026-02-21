import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { api } from '../services/api';
import type { User } from '../types';

interface ClerkAuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null | undefined;
  getToken: () => Promise<string | null>;
  user: any; // Clerk user
  dbUser: User | null; // Notre utilisateur en base
  syncUserWithDatabase: () => Promise<void>;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, userId, getToken, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);

  // Synchroniser l'utilisateur Clerk avec notre base de données
  const syncUserWithDatabase = async () => {
    if (!isSignedIn || !clerkUser || !userId) return;

    try {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      if (!email) return;

      // Chercher l'utilisateur dans notre base
      const users = await api.searchUsers({ email });
      
      if (users.length === 0) {
        // Créer l'utilisateur dans notre base
        const newUser = await api.createUser({
          clerkId: userId,
          email: email,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Utilisateur',
          userType: 'READER',
        });
        setDbUser(newUser);
      } else {
        setDbUser(users[0]);
      }
    } catch (error) {
      console.error('Erreur synchronisation utilisateur:', error);
    }
  };

  // Synchroniser au chargement et quand l'utilisateur change
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      syncUserWithDatabase();
    } else {
      setDbUser(null);
    }
  }, [isSignedIn, clerkUser, userId]);

  const value = {
    isLoaded,
    isSignedIn,
    userId,
    getToken,
    user: clerkUser,
    dbUser,
    syncUserWithDatabase,
  };

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  );
};

export const useClerkAuth = () => {
  const context = useContext(ClerkAuthContext);
  if (!context) {
    throw new Error('useClerkAuth must be used within ClerkAuthProvider');
  }
  return context;
};