import { createContext } from "react";
import type { User } from "../types";
import { useUser } from "@clerk/clerk-react";

type ClerkUser = ReturnType<typeof useUser>["user"];

export interface ClerkAuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null | undefined;
  getToken: () => Promise<string | null>;
  user: ClerkUser;
  dbUser: User | null;
  syncUserWithDatabase: () => Promise<User | null>;
}

export const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);