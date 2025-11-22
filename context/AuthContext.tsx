import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
        const authenticatedUser = await db.authenticateUser(username, password);
        if (authenticatedUser) {
            setUser(authenticatedUser);
            localStorage.setItem('authUser', JSON.stringify(authenticatedUser));
            return true;
        }
        return false;
    } catch (error) {
        console.error("Login error", error);
        return false;
    }
  };

  const register = async (username: string, password: string, role: UserRole) => {
      try {
          const newUser = await db.registerUser(username, password, role);
          if (newUser) {
            setUser(newUser);
            localStorage.setItem('authUser', JSON.stringify(newUser));
            return true;
          }
          return false;
      } catch (error) {
          console.error("Registration error", error);
          throw error; // Re-throw to handle specific messages like "User exists"
      }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};