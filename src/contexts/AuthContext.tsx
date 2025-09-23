import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for our auth system
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message: string }>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
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
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved user session on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('localjobzz_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('localjobzz_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Mock API calls - replace with your actual backend API
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      // Replace this with actual API call to your backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        localStorage.setItem('localjobzz_user', JSON.stringify(userData.user));
        return { success: true, message: 'Login successful!' };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || 'Login failed' };
      }
    } catch (error) {
      // For demo purposes - remove this and uncomment the API call above
      if (email === 'demo@test.com' && password === 'demo123') {
        const demoUser: User = {
          id: 'demo-user-id',
          name: 'Demo User',
          email: 'demo@test.com',
          phone: '+1234567890',
          createdAt: new Date().toISOString()
        };
        setUser(demoUser);
        localStorage.setItem('localjobzz_user', JSON.stringify(demoUser));
        return { success: true, message: 'Login successful!' };
      }
      return { success: false, message: 'Invalid email or password' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      // Replace this with actual API call to your backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const responseData = await response.json();
        setUser(responseData.user);
        localStorage.setItem('localjobzz_user', JSON.stringify(responseData.user));
        return { success: true, message: 'Account created successfully!' };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || 'Registration failed' };
      }
    } catch (error) {
      // For demo purposes - remove this and uncomment the API call above
      const newUser: User = {
        id: 'user-' + Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        createdAt: new Date().toISOString()
      };
      setUser(newUser);
      localStorage.setItem('localjobzz_user', JSON.stringify(newUser));
      return { success: true, message: 'Account created successfully!' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('localjobzz_user');
  };

  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'No user logged in' };

    setIsLoading(true);
    
    try {
      // Replace this with actual API call to your backend
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
        localStorage.setItem('localjobzz_user', JSON.stringify(updatedUser.user));
        return { success: true, message: 'Profile updated successfully!' };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || 'Update failed' };
      }
    } catch (error) {
      // For demo purposes - remove this and uncomment the API call above
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('localjobzz_user', JSON.stringify(updatedUser));
      return { success: true, message: 'Profile updated successfully!' };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};