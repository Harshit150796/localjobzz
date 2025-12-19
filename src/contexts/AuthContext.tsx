import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Types for our auth system
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message: string }>;
  signInWithGoogle: () => Promise<void>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Set up auth state listeners and check for existing session
  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event);
        setSession(session);
        
        if (session?.user && !profileLoaded) {
          // Only fetch profile if not already loaded
          setTimeout(() => {
            if (isMounted) {
              fetchUserProfile(session.user.id);
              setProfileLoaded(true);
            }
          }, 0);
        } else if (!session?.user) {
          setUser(null);
          setProfileLoaded(false);
        }
        
        // Only set isLoading false if we've done initial check OR this is a definitive event
        if (sessionChecked || event !== 'INITIAL_SESSION') {
          setIsLoading(false);
        }
      }
    );

    // Get initial session - DO THIS ONCE
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      
      setSession(session);
      setSessionChecked(true); // Mark as checked
      
      if (session?.user && !profileLoaded) {
        setTimeout(() => {
          if (isMounted) {
            fetchUserProfile(session.user.id);
            setProfileLoaded(true);
          }
        }, 0);
      }
      
      setIsLoading(false); // Now safe to say we're done loading
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - run once

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setUser({
        id: data.user_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar_url: data.avatar_url,
        bio: data.bio,
        location: data.location,
        skills: data.skills,
        created_at: data.created_at
      });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Login successful!' };
    } catch (error) {
      return { success: false, message: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };


  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    if (!user || !session) return { success: false, message: 'No user logged in' };

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          phone: userData.phone,
          bio: userData.bio,
          location: userData.location,
          skills: userData.skills,
          avatar_url: userData.avatar_url
        })
        .eq('user_id', user.id);

      if (error) {
        return { success: false, message: error.message };
      }

      // Refresh user profile
      await fetchUserProfile(user.id);
      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      return { success: false, message: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };


  const value: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    logout,
    updateProfile,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};