import React, {  useEffect, useState, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { api } from '../services/api';
import type { User } from '../types';
import { ClerkAuthContext } from "./clerk-auth.context";
type ClerkUser = ReturnType<typeof useUser>['user'];

interface ClerkAuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null | undefined;
  getToken: () => Promise<string | null>;
  user: ClerkUser;
  dbUser: User | null;
  syncUserWithDatabase: () => Promise<User | null>;
}

// export const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, userId, getToken, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);

  // 🔥 Synchronisation DB
  const syncUserWithDatabase = useCallback(async (): Promise<User | null> => {
    if (!isSignedIn || !clerkUser || !userId) return null;

    try {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      if (!email) return null;

      const users = await api.searchUsers({ clerkId: userId, email });

      if (users.length === 0) {
        const newUser = await api.createUser({
          clerkId: userId,
          email,
          name:
            `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
            'Utilisateur',
          userType: 'READER',
        });
        setDbUser(newUser);
        return newUser;
      } else {
        setDbUser(users[0]);
        return users[0];
      }
    } catch (error) {
      console.error('Erreur synchronisation utilisateur:', error);
      return null;
    }
  }, [isSignedIn, clerkUser, userId]);

  // 🔐 Setup token + sync
  useEffect(() => {
    const setup = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !clerkUser) {
        setDbUser(null);
        await api.setAuthToken(null);
        return;
      }

      const token = await getToken();
      await api.setAuthToken(token);

      await syncUserWithDatabase();
    };

    setup();
  }, [isLoaded, isSignedIn, clerkUser, getToken, syncUserWithDatabase]);

  const value: ClerkAuthContextType = {
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