import { createContext, ReactNode, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  isAuthenticated: boolean;
  role: "student" | "admin" | "super_admin" | null;
  token: string | null;
  login: (
    email: string,
    token: string,
    role: "student" | "admin" | "super_admin"
  ) => void;
  logout: () => void;
  userEmail: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [state, setState] = useState(() => ({
    isAuthenticated: localStorage.getItem("token") !== null,
    userEmail: localStorage.getItem("email") || "",
    role: localStorage.getItem("role") as
      | "student"
      | "admin"
      | "super_admin"
      | null,
    token: localStorage.getItem("token"),
  }));

  const navigate = useNavigate();

  const login = (
    email: string,
    token: string,
    role: "student" | "admin" | "super_admin"
  ) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role);

    setState({
        isAuthenticated: true,
        userEmail: email,
        role,
        token
    })

    if(role === "student"){
        navigate("/dashboard");
    }else if(role === 'admin' || role === 'super_admin') {
        navigate("/admin/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    setState({
        isAuthenticated: false,
        userEmail: "",
        role: null,
        token: null
    })
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout}}
    >
      {children}
    </AuthContext.Provider>
  );
};

//**кастомный хук */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
