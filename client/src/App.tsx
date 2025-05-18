import "./App.scss";
import { AuthProvider } from "./context/AuthContext";
import RegisterPage from "./pages/RegisterPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import TestPage from "./pages/TestPage";
import { MainLayout } from "./components/MainLayout";
import { AuthForm } from "./components/AuthForm";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin/register"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <AdminRegisterPage />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <ProtectedRoute allowedRoles={["student"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                </MainLayout>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <MainLayout>
                  <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                </MainLayout>
              }
            />
            <Route
              path="/test"
              element={
                <MainLayout>
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TestPage />
                  </ProtectedRoute>
                </MainLayout>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
