import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { CategoriesPage } from "@/pages/Categories";
import { TransactionsPage } from "@/pages/Transactions";

function DashboardPage() {
  return (
    <div className="animate-bounce-in">
      <h1 className="text-3xl font-bold text-card-foreground mb-2">Dashboard</h1>
      <p className="text-muted-foreground">Bienvenido a Money Manager</p>
    </div>
  );
}

function DebtsPage() {
  return (
    <div className="animate-bounce-in">
      <h1 className="text-3xl font-bold text-card-foreground mb-2">Deudas</h1>
      <p className="text-muted-foreground">Controla tus deudas</p>
    </div>
  );
}

function App() {
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
