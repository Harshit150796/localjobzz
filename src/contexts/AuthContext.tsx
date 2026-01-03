import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import '@/types/google.d.ts';

// Google Client ID - Replace with your actual client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

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
  isGoogleLoaded: boolean;
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
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

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

  // Initialize Google Identity Services
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && !googleInitialized) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setGoogleInitialized(true);
          setIsGoogleLoaded(true);
          console.log('Google Identity Services initialized');
        } catch (error) {
          console.error('Failed to initialize Google Identity Services:', error);
        }
      }
    };

    // Check if Google script is already loaded
    if (window.google) {
      initializeGoogle();
    } else {
      // Wait for script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          initializeGoogle();
          clearInterval(checkGoogle);
        }
      }, 100);

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkGoogle), 10000);
    }
  }, [googleInitialized]);

  // Handle Google callback with ID token
  const handleGoogleCallback = useCallback(async (response: { credential: string }) => {
    try {
      console.log('Google callback received, signing in with ID token...');
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        console.error('Supabase signInWithIdToken error:', error);
        throw error;
      }

      console.log('Successfully signed in with Google');
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!window.google) {
      throw new Error('Google Identity Services not loaded. Please refresh the page and try again.');
    }

    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      throw new Error('Google OAuth is not configured. Please set up the Google Client ID.');
    }

    // Trigger the Google One Tap or popup
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.log('Google prompt not displayed:', notification.getNotDisplayedReason());
        // Fallback: Use popup mode by rendering a button
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.top = '50%';
        tempContainer.style.left = '50%';
        tempContainer.style.transform = 'translate(-50%, -50%)';
        tempContainer.style.zIndex = '9999';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '20px';
        tempContainer.style.borderRadius = '8px';
        tempContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        document.body.appendChild(tempContainer);

        window.google!.accounts.id.renderButton(tempContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        });

        // Auto-click the button
        setTimeout(() => {
          const googleBtn = tempContainer.querySelector('div[role="button"]') as HTMLElement;
          if (googleBtn) {
            googleBtn.click();
          }
          // Remove container after a delay
          setTimeout(() => {
            if (tempContainer.parentNode) {
              tempContainer.parentNode.removeChild(tempContainer);
            }
          }, 100);
        }, 100);
      } else if (notification.isSkippedMoment()) {
        console.log('Google prompt skipped:', notification.getSkippedReason());
      } else if (notification.isDismissedMoment()) {
        console.log('Google prompt dismissed:', notification.getDismissedReason());
      }
    });
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
    signInWithGoogle,
    isGoogleLoaded
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};