import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ACCOUNTS_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  createAccount,
  endSession,
  loadSessionUser,
  signIn,
  startSession,
  toAuthUser,
  workspaceHasAdmin,
  type AuthUser,
  type RegisterInput,
  type SignInInput,
} from '../lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  hasAdmin: boolean;
  register: (input: RegisterInput) => Promise<AuthUser>;
  login: (input: SignInInput) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadSessionUser);
  const [hasAdmin, setHasAdmin] = useState(workspaceHasAdmin);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ACCOUNTS_STORAGE_KEY && event.key !== SESSION_STORAGE_KEY) return;
      setUser(loadSessionUser());
      setHasAdmin(workspaceHasAdmin());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const account = await createAccount(input);
    const authUser = toAuthUser(account);
    setHasAdmin(workspaceHasAdmin());
    startSession(account.id);
    setUser(authUser);
    return authUser;
  }, []);

  const login = useCallback(async (input: SignInInput) => {
    const account = await signIn(input);
    startSession(account.id);
    const authUser = toAuthUser(account);
    setUser(authUser);
    setHasAdmin(workspaceHasAdmin());
    return authUser;
  }, []);

  const logout = useCallback(() => {
    endSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, hasAdmin, register, login, logout }),
    [user, hasAdmin, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
