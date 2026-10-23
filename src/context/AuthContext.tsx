import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  apiRequest,
  setAuthTokens,
  clearAuthState,
  getRefreshToken,
  getAccessToken,
  subscribeAuthState,
  type ApiSchemas,
} from '../api/client';

type UserResponse = ApiSchemas['UserResponse'];

interface AuthContextValue {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: ApiSchemas['UserLoginRequest']) => Promise<void>;
  signup: (payload: ApiSchemas['UserSignupRequest']) => Promise<UserResponse>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadCurrentUser = useCallback(async () => {
    const hasSession = Boolean(getAccessToken() || getRefreshToken());
    if (!hasSession) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await apiRequest<UserResponse>('/v1/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
    const unsubscribe = subscribeAuthState((authed) => {
      if (!authed) {
        setUser(null);
      }
    });
    return unsubscribe;
  }, [loadCurrentUser]);

  const login = async (payload: ApiSchemas['UserLoginRequest']) => {
    const tokens = await apiRequest<ApiSchemas['TokenResponse']>('/v1/auth/login', {
      method: 'POST',
      body: payload,
      skipAuthRefresh: true,
    });
    setAuthTokens(tokens.access_token, tokens.refresh_token);
    const me = await apiRequest<UserResponse>('/v1/auth/me');
    setUser(me);
  };

  const signup = async (payload: ApiSchemas['UserSignupRequest']) => {
    return apiRequest<UserResponse>('/v1/auth/signup', {
      method: 'POST',
      body: payload,
      skipAuthRefresh: true,
    });
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await apiRequest('/v1/auth/logout', {
          method: 'POST',
          body: { refresh_token: refreshToken },
          skipAuthRefresh: true,
        });
      }
    } finally {
      clearAuthState();
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      await apiRequest('/v1/auth/logout-all', {
        method: 'POST',
      });
    } finally {
      clearAuthState();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        logout,
        logoutAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
