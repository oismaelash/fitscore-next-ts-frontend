'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginForm, SignupForm } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (credentials: LoginForm) => Promise<void>;
  signup: (userData: SignupForm) => Promise<void>;
  logout: () => void;
  clearError: () => void;
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
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TODO: Implement session check with Supabase
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Verify token and get user data
          // For now, we'll just check if token exists
          // dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginForm) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // TODO: Implement Supabase authentication
      // const { data, error } = await supabase.auth.signInWithPassword(credentials);
      
      // Mock implementation for now
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: 'John Doe',
        role: 'manager',
        createdAt: new Date().toISOString(),
      };

      // Store token
      localStorage.setItem('auth_token', 'mock_token');
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed' });
    }
  };

  const signup = async (userData: SignupForm) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // TODO: Implement Supabase signup
      // const { data, error } = await supabase.auth.signUp(userData);
      
      // Mock implementation for now
      const mockUser: User = {
        id: '1',
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: new Date().toISOString(),
      };

      // Store token
      localStorage.setItem('auth_token', 'mock_token');
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Signup failed' });
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
