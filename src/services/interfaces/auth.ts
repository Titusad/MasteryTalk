/**
 * IAuthService — Authentication operations
 *
 * Production: Supabase Auth (Google provider)
 * Mock: Returns fake user after simulated delay
 */
import type { User, AuthProvider } from "../types";

export interface IAuthService {
  /** Sign in with a social provider (Google) */
  signIn(provider: AuthProvider): Promise<User>;

  /** Sign out the current user */
  signOut(): Promise<void>;

  /** Get the currently authenticated user, or null */
  getCurrentUser(): User | null;

  /** Subscribe to auth state changes */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}