import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import API from "../api/axios";
import {
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
} from "../utils/storage";
import { userStatus } from "../api/model";

interface Token {
  accessToken: string;
  refreshToken: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface Profile {
  isAdmin: boolean;
  id: string;
  email: string;
  displayName: string;
  status: userStatus;
}

interface AuthContextProps {
  isLoggedIn: boolean;
  isError: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  profile: Profile | null;
  getProfile: () => Promise<Profile | null>;
  token: Token | null;
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  isError: false,
  login: async () => {},
  logout: () => {},
  profile: null,
  getProfile: async () => null,
  token: null,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [token, setToken] = useState<Token | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const login = async (credentials: Credentials) => {
    try {
      const res = await API.post<Token>("/v1/auth/login", credentials);
      if (res.status !== 200) {
        setIsError(true);
        return;
      }

      setIsError(false);
      setIsLoggedIn(true);
      setToken(res.data);
      setTokenToLocalStorage(res.data.accessToken, res.data.refreshToken);
      await getProfile();
    } catch {
      setIsError(true);
    }
  };

  const getProfile = useCallback(async (): Promise<Profile | null> => {
    try {
      const res = await API.get<{ profile: Profile }>("/v1/auth/profile");
      if (res.status !== 200) {
        logout();
        return null;
      }

      setProfile(res.data.profile);
      return res.data.profile;
    } catch {
      logout();
      return null;
    }
  }, []);

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setProfile(null);
    localStorage.clear();
  };

  useEffect(() => {
    const token = getTokenFromLocalStorage("accessToken");
    if (token) {
      setIsLoggedIn(true);
      getProfile();
    }
  }, [getProfile]);

  const value = {
    profile,
    isLoggedIn,
    isError,
    login,
    logout,
    getProfile,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
