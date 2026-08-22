import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { CategoriesPage } from "@/pages/Categories";
import { TransactionsPage } from "@/pages/Transactions";
import { DebtsPage } from "@/pages/Debts";
import { DashboardPage } from "@/pages/Dashboard";
import { useAuthStore } from "@/store/auth";

function App() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token, fetchProfile]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/debts" element={<DebtsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
