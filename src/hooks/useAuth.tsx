import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { clearSession, getStoredToken, setStoredToken } from '@/api/axiosClient';
import type { LoginPayload, RegisterPayload, User } from '@/types/api';

const USER_KEY = 'aicareer_user';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((token: string, nextUser: User) => {
    setStoredToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    navigate('/auth');
  }, [navigate]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await authApi.login(payload);
      if (!data.success || !data.token) {
        throw new Error(data.message || 'Login failed');
      }
      persistSession(data.token, data.user);
      navigate('/dashboard');
    },
    [navigate, persistSession]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data } = await authApi.register(payload);
      if (!data.success || !data.token) {
        throw new Error(data.message || 'Registration failed');
      }
      persistSession(data.token, data.user);
      navigate('/dashboard');
    },
    [navigate, persistSession]
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const { data } = await authApi.googleLogin({ credential });
      if (!data.success || !data.token) {
        throw new Error(data.message || 'Google sign-in failed');
      }
      persistSession(data.token, data.user);
      navigate('/dashboard');
    },
    [navigate, persistSession]
  );

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .getMe()
      .then(({ data }) => {
        if (data.success && data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          setUser(data.user);
        }
      })
      .catch(() => {
        logout();
      })
      .finally(() => setIsLoading(false));
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [user, isLoading, login, register, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
