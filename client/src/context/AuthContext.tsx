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
  userId: number | null;
  hasPassedTest: boolean;
  checkTestStatus: () => Promise<void>;
  markTestAsPassed: () => Promise<void>;
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
    userId: localStorage.getItem("userId")
      ? parseInt(localStorage.getItem("userId")!)
      : null,
    hasPassedTest: false,
  }));

  const navigate = useNavigate();

  const checkTestStatus = async () => {
    if (state.role !== "student" || !state.userId) {
      return;
    }

    try {
      const res = await fetch(`/api/students/${state.userId}/test-status`);
      const data = await res.json();
      setState((prev) => ({ ...prev, hasPassedTest: data.hasPassedTest }));
    } catch (error) {
      console.log(error);
    }
  };

  const markTestAsPassed = async () => {
    if (!state.userId) {
      return;
    }
    try {
      await fetch(`/api/students/${state.userId}/complete-test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
      setState((prev) => ({ ...prev, hasPassedTest: true }));
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  const login = async (
    email: string,
    token: string,
    role: "student" | "admin" | "super_admin"
  ) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role);

    let userId: number | null = null;
    let hasPassedTest = false;

    if (role === "student") {
      try {
        const res = await fetch(
          `/api/students/get-id?email=${encodeURIComponent(email)}`
        );
        const data = await res.json();

        if (data.id) {
          userId = data.id;
          localStorage.setItem("userId", userId.toString());

          const testStatusRes = await fetch(
            `/api/students/${userId}/test-status`
          );
          const testStatusData = await testStatusRes.json();
          hasPassedTest = testStatusData.hasPassedTest;
        }
      } catch (error) {
        console.log(error);
      }
    }

    setState({
      isAuthenticated: true,
      userEmail: email,
      role,
      token,
      userId,
      hasPassedTest,
    });

    if (role === "student") {
      navigate("/dashboard");
    } else if (role === "admin" || role === "super_admin") {
      navigate("/admin/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    setState({
      isAuthenticated: false,
      userEmail: "",
      role: null,
      token: null,
      userId: null,
      hasPassedTest: false,
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, checkTestStatus, markTestAsPassed }}
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
