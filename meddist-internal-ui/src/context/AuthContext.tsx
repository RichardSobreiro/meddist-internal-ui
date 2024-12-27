/** @format */

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

interface BearerToken {
  username: string;
}

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface User {
  accessToken: string;
  refreshToken: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const decodeJwt = (token: string) => {
  const base64Url = token.split(".")[1]; // get the payload part
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const setAuthenticationState = useCallback(
    (accessToken: string, refreshToken: string, rememberMe: boolean) => {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      if (rememberMe) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      } else {
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);
      }
      const token: BearerToken = decodeJwt(accessToken);
      const username: string = token.username;
      setUser({ accessToken, refreshToken, username });
    },
    []
  );

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post("http://localhost:3003/auth/login", {
        email: credentials.username,
        password: credentials.password,
      });
      const accessToken: string = response.data.access_token;
      const refreshToken: string = response.data.refresh_token;
      setAuthenticationState(accessToken, refreshToken, credentials.rememberMe);
      axios.interceptors.request.use(
        (config) => {
          let token = localStorage.getItem("accessToken");
          if (!token) {
            token = sessionStorage.getItem("accessToken");
          }
          if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Unknown error occurred"
        );
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    const accessTokenLocalStorage = localStorage.getItem("accessToken");
    const refreshTokenLocalStorage = localStorage.getItem("refreshToken");
    if (accessTokenLocalStorage && refreshTokenLocalStorage) {
      setAuthenticationState(
        accessTokenLocalStorage,
        refreshTokenLocalStorage,
        true
      );
      axios.interceptors.request.use(
        (config) => {
          config.headers["Authorization"] = `Bearer ${accessTokenLocalStorage}`;
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    } else {
      const accessTokenSessionStorage = sessionStorage.getItem("accessToken");
      const refreshTokenSessionStorage = sessionStorage.getItem("refreshToken");
      if (accessTokenSessionStorage && refreshTokenSessionStorage) {
        setAuthenticationState(
          accessTokenSessionStorage,
          refreshTokenSessionStorage,
          false
        );
        axios.interceptors.request.use(
          (config) => {
            config.headers[
              "Authorization"
            ] = `Bearer ${accessTokenSessionStorage}`;
            return config;
          },
          (error) => {
            return Promise.reject(error);
          }
        );
      } else {
        logout();
      }
    }
  }, [setAuthenticationState]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
