import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: string | null;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.debug('Auth state changed:', event, 'User:', !!session?.user, 'Loading will be set to false');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Defer role fetching to avoid callback blocking
        if (session?.user) {
          console.debug('User exists, fetching role...');
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          console.debug('No user, setting role to null');
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.debug('Fetching user role for user ID:', userId);
      const { data, error } = await supabase.rpc('get_current_user_role');

      if (error) {
        console.error('Error fetching user role via RPC:', error);
        setUserRole(null);
        return;
      }

      console.debug('User role from RPC result:', data);
      setUserRole(data || null);
    } catch (error) {
      console.error('Exception in fetchUserRole:', error);
      setUserRole(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        // Even if there's an error, clear local state
      }
      console.log('Sign out completed');
    } catch (error) {
      console.error('Sign out exception:', error);
    } finally {
      // Always clear local state regardless of API response
      setUser(null);
      setSession(null);
      setUserRole(null);
    }
  };

  const refreshUserRole = async () => {
    if (user) {
      await fetchUserRole(user.id);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    userRole,
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}