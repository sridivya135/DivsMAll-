import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { authApi, authStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [loading, setLoading] = useState(Boolean(authStorage.getAccess()));

  useEffect(() => {
    if (!authStorage.getAccess()) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    authApi
      .me()
      .then(({ data }) => {
        if (!active) return;
        setUser(data);
        authStorage.setUser(data);
      })
      .catch(() => {
        if (!active) return;
        authStorage.clear();
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (username, password) => {
    const { data } = await authApi.login({ username, password });
    authStorage.setSession(data);
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const { data } = await authApi.signup(payload);
    authStorage.setSession(data);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    const refresh = authStorage.getRefresh();
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // The local session is cleared even if the server rejects the token.
    }
    authStorage.clear();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      isAdmin: user?.role === 'admin' || Boolean(user?.is_superuser),
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
