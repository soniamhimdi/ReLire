import { useContext } from "react";
import { ClerkAuthContext } from "./clerk-auth.context";

export const useClerkAuth = () => {
  const context = useContext(ClerkAuthContext);

  if (!context) {
    throw new Error("useClerkAuth must be used within ClerkAuthProvider");
  }

  return context;
};