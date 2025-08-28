import React, { createContext, useContext, useState, useEffect } from "react";

import { getRoleByToken, getUsernameByToken } from "../utils/JwtService";

// Kiểu dữ liệu context
interface AuthContextProps {
  token: string | null;
  role: string | null;
  userName: string | null;
  setAuth: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  token: null,
  role: null,
  userName: null,
  setAuth: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Cập nhật khi token thay đổi
useEffect(() => {
  if (token) {
    setRole(getRoleByToken() ?? null);
    setUserName(getUsernameByToken() ?? null);
    localStorage.setItem("token", token);
  } else {
    setRole(null);
    setUserName(null);
    localStorage.removeItem("token");
  }
}, [token]);


  // Hàm gọi sau khi đăng nhập thành công
  const setAuth = (newToken: string | null) => {
    setToken(newToken);
  };

  // Hàm logout
  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userName, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook dùng cho component con
export const useAuth = () => useContext(AuthContext);
