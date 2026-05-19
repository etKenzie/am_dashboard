'use client';

import { supabase, supabaseForPasswordReset } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: string[];
  authLoading: boolean;
  rolesLoading: boolean;
  loading: boolean; // Computed property for backward compatibility
  isAuthenticated: boolean; // Helper to check if user is fully authenticated
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resetPasswordWithToken: (newPassword: string) => Promise<void>;
  getUserRoles: (userId: string) => Promise<string[]>;
  refreshRoles: () => Promise<string[]>;
}

const AUTH_STORAGE_KEY = 'am-dashboard-auth';
const SESSION_FETCH_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function clearPersistedAuthSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  
  // Refs to prevent unnecessary state updates
  const userRef = useRef<User | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const isInitialized = useRef(false);

  // Sticky state for user and session to prevent loading states during tab switches
  const stickyUser = useRef<User | null>(null);
  const stickySession = useRef<Session | null>(null);
  const stickyRoles = useRef<string[]>([]);
  const isTabSwitch = useRef(false);

  // Simple function to update auth state
  const updateAuth = useCallback((newSession: Session | null, newUser: User | null) => {
    // Only update if the values actually changed
    if (newSession !== sessionRef.current || newUser !== userRef.current) {
      setSession(newSession);
      setUser(newUser);
      sessionRef.current = newSession;
      userRef.current = newUser;
      
      // Update sticky state when auth actually changes
      if (newUser) {
        stickyUser.current = newUser;
        stickySession.current = newSession;
        // Also update sticky roles if we have them
        if (roles.length > 0) {
          stickyRoles.current = roles;
        }
      }
    }
  }, []); // Remove roles dependency to prevent infinite loop

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await withTimeout(
          supabase.auth.getSession(),
          SESSION_FETCH_TIMEOUT_MS,
          'Session fetch timed out'
        );

        if (error) {
          console.error('Error getting session:', error);
          clearPersistedAuthSession();
          updateAuth(null, null);
          setRoles([]);
          setAuthLoading(false);
          setRolesLoading(false);
          isInitialized.current = true;
          return;
        }

        updateAuth(session, session?.user ?? null);
        setAuthLoading(false);

        if (session?.user) {
          setRolesLoading(true);
          getUserRoles(session.user.id).catch(() => {
            setRoles(['user']);
            setRolesLoading(false);
          });
        } else {
          setRoles([]);
          setRolesLoading(false);
        }

        isInitialized.current = true;
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        clearPersistedAuthSession();
        updateAuth(null, null);
        setAuthLoading(false);
        setRolesLoading(false);
        setRoles([]);
        isInitialized.current = true;
      }
    };

    getInitialSession();

    // Listen for auth changes with debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip if not initialized yet to prevent race conditions
        if (!isInitialized.current) return;
        
        // Skip if this is a tab switch and we have valid sticky state
        if (isTabSwitch.current && stickyUser.current && stickyRoles.current.length > 0) {
          return;
        }

        updateAuth(session, session?.user ?? null);

        if (session?.user) {
          if (isTabSwitch.current && stickyRoles.current.length > 0) {
            setRoles(stickyRoles.current);
            setRolesLoading(false);
          } else {
            setRolesLoading(true);
            getUserRoles(session.user.id).catch(() => {
              setRoles(['user']);
              setRolesLoading(false);
            });
          }
        } else {
          setRoles([]);
          setRolesLoading(false);
        }
      }
    );

    // Handle browser visibility changes to prevent unnecessary auth reloads
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        isTabSwitch.current = true;
        setTimeout(() => {
          isTabSwitch.current = false;
        }, 2000);
      }
    };

    const handleFocus = () => {
      // Maintain current auth state; no extra refresh on focus
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, []); // Empty dependency array to prevent unnecessary re-runs

  const getUserRoles = async (userId: string): Promise<string[]> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setRoles(['user']);
          setRolesLoading(false);
          stickyRoles.current = ['user'];
          return ['user'];
        }
        setRoles(['user']);
        setRolesLoading(false);
        stickyRoles.current = ['user'];
        return ['user'];
      }

      const userRoles = profile?.roles || [];
      if (userRoles.length === 0) {
        setRoles(['user']);
        setRolesLoading(false);
        stickyRoles.current = ['user'];
        return ['user'];
      }

      setRoles(userRoles);
      setRolesLoading(false);
      stickyRoles.current = userRoles;
      return userRoles;
    } catch {
      setRoles(['user']);
      setRolesLoading(false);
      stickyRoles.current = ['user'];
      return ['user'];
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign in process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Sign in successful, auth state change will handle role fetching');
      console.log('Sign in process completed');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setRoles([]);
      setAuthLoading(false);
      setRolesLoading(false);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during sign out:', error);
        // Even if there's an error, we should still clear local state
        // and redirect to login
      }
      
      console.log('Sign out completed');
      
      // Force redirect to login page
      window.location.href = '/auth/login';
      
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      // Clear state and redirect even if there's an error
      setUser(null);
      setSession(null);
      setRoles([]);
      setAuthLoading(false);
      setRolesLoading(false);
      window.location.href = '/auth/login';
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Sending password reset email to:', email);
      
      // Get the base URL for redirect
      // Use window.location.origin to get the full URL including protocol and domain
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${baseUrl}/auth/reset-password`;
      
      console.log('Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
        // Optional: Add email template customization
        // emailRedirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('Supabase reset password error:', error);
        throw error;
      }
      
      console.log('Password reset email sent successfully');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  const resetPasswordWithToken = async (newPassword: string) => {
    try {
      console.log('Resetting password with token...');
      
      // Use the password reset client which has the session
      const { error } = await supabaseForPasswordReset.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      console.log('Password reset successful');
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const refreshRoles = async () => {
    if (user) {
      console.log('Manually refreshing roles for user:', user.id);
      setRolesLoading(true);
      try {
        const userRoles = await getUserRoles(user.id);
        console.log('Roles refreshed successfully:', userRoles);
        return userRoles;
      } catch (error) {
        console.error('Error refreshing roles:', error);
        setRoles(['user']); // Set default role on error
        setRolesLoading(false);
        return ['user'];
      }
    }
    return [];
  };



  const value = {
    user: user || stickyUser.current, // Use sticky user if current user is null
    session: session || stickySession.current, // Use sticky session if current session is null
    roles: roles.length > 0 ? roles : stickyRoles.current, // Use sticky roles if current roles are empty
    authLoading: authLoading && !stickyUser.current, // Don't show loading if we have sticky auth
    rolesLoading: rolesLoading && !stickyRoles.current.length, // Don't show loading if we have sticky roles
    loading: (authLoading && !stickyUser.current) || (rolesLoading && !stickyRoles.current.length), // Computed property for backward compatibility
    isAuthenticated: Boolean((!authLoading || stickyUser.current) && !!(user || stickyUser.current) && (!rolesLoading || stickyRoles.current.length)), // Helper to check if user is fully authenticated
    signIn,
    signUp,
    signOut,
    resetPassword,
    resetPasswordWithToken,
    getUserRoles,
    refreshRoles,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
