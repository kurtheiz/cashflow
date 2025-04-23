import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JWT_STORAGE_KEY, USER_STORAGE_KEY, ALLOWED_USERS, ENABLE_ACCESS_CONTROL } from '../config/auth';
import { jwtDecode } from 'jwt-decode';

interface UserInfo {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Google's user ID
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserInfo | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthorized: boolean;
  authorizationError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authorizationError, setAuthorizationError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(JWT_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    
    if (storedToken && storedUser) {
      try {
        // Check if token is expired
        const decodedToken: any = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp && decodedToken.exp > currentTime) {
          // Token is still valid
          const userInfo = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userInfo);
          setIsLoggedIn(true);
          
          // Check if user is authorized
          checkUserAuthorization(userInfo);
        } else {
          // Token is expired, clear storage
          localStorage.removeItem(JWT_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch (error) {
        // Invalid token, clear storage
        localStorage.removeItem(JWT_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        console.error('Error decoding token:', error);
      }
    }
    
    setIsLoading(false);
  }, []);
  
  // Check if a user is authorized to access the app
  const checkUserAuthorization = (userInfo: UserInfo) => {
    if (!ENABLE_ACCESS_CONTROL) {
      // Access control is disabled, all users are authorized
      setIsAuthorized(true);
      setAuthorizationError(null);
      return;
    }
    
    // Check if the user's email is in the allowed users list
    if (ALLOWED_USERS.includes(userInfo.email)) {
      setIsAuthorized(true);
      setAuthorizationError(null);
    } else {
      setIsAuthorized(false);
      setAuthorizationError('You do not have permission to access this application.');
      console.warn(`Unauthorized access attempt by: ${userInfo.email}`);
    }
  };

  const login = (googleToken: string) => {
    try {
      // Decode the JWT to get user info
      const decodedToken: any = jwtDecode(googleToken);
      
      // Extract user information
      const userInfo: UserInfo = {
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        sub: decodedToken.sub
      };
      
      // Store token and user info
      localStorage.setItem(JWT_STORAGE_KEY, googleToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userInfo));
      
      // Update state
      setToken(googleToken);
      setUser(userInfo);
      setIsLoggedIn(true);
      
      // Check if user is authorized
      checkUserAuthorization(userInfo);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    // Clear storage
    localStorage.removeItem(JWT_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    
    // Update state
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setIsAuthorized(false);
    setAuthorizationError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      token, 
      login, 
      logout, 
      isLoading,
      isAuthorized,
      authorizationError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
