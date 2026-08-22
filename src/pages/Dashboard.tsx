import { useState, useEffect } from "react";
import { transactionApi } from "@/api/transaction";
import { debtApi } from "@/api/debt";
import { categoryApi } from "@/api/category";
import type {
  TransactionResponseDTO,
  DebtResponseDTO,
  CategoryResponseDTO,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FolderOpen,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionResponseDTO[]>([]);
  const [debts, setDebts] = useState<DebtResponseDTO[]>([]);
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [txData, debtData, catData] = await Promise.all([
          transactionApi.getAll({ page: 0, size: 50 }),
          debtApi.getAll(),
          categoryApi.getAll(),
        ]);
        setTransactions(txData.content);
        setDebts(debtData);
        setCategories(catData);
      } catch {
        // error handled by UI state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Stats
  const totalIncome = transactions
    .filter((t) => t.transactionType.toUpperCase() === "INCOME")
    .reduce((sum, t) => sum + (t.price || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.transactionType.toUpperCase() === "EXPENSE")
    .reduce((sum, t) => sum + (t.price || 0), 0);

  const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaid = debts.reduce(
    (sum, d) => sum + (d.payments?.reduce((ps, p) => ps + p.amount, 0) || 0),
    0
  );
  const remainingDebt = totalDebt - totalPaid;

  const recentTransactions = [...transactions]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  // Monthly data for chart
  const monthlyData = transactions.reduce(
    (acc, t) => {
      const dateParts = t.transactionDate.split("-");
      const monthKey = dateParts.length === 3 ? `${dateParts[1]}-${dateParts[0]}` : t.transactionDate.substring(0, 7);
      if (!acc[monthKey]) acc[monthKey] = { income: 0, expense: 0 };
      if (t.transactionType.toUpperCase() === "INCOME") {
        acc[monthKey].income += t.price || 0;
      } else {
        acc[monthKey].expense += t.price || 0;
      }
      return acc;
    },
    {} as Record<string, { income: number; expense: number }>
  );

  const monthlyKeys = Object.keys(monthlyData).sort().slice(-6);
  const maxMonthly = Math.max(
    ...monthlyKeys.map((k) => Math.max(monthlyData[k].income, monthlyData[k].expense)),
    1
  );

  const MONTH_NAMES = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const stats = [
    {
      title: "Ingresos totales",
      value: `${totalIncome.toFixed(2)} €`,
      icon: TrendingUp,
      color: "text-tertiary",
      bg: "bg-tertiary-50",
      shadow: "shadow-tertiary",
    },
    {
      title: "Gastos totales",
      value: `${totalExpenses.toFixed(2)} €`,
      icon: TrendingDown,
      color: "text-primary",
      bg: "bg-primary-50",
      shadow: "shadow-primary",
    },
    {
      title: "Deuda restante",
      value: `${remainingDebt.toFixed(2)} €`,
      icon: CreditCard,
      color: "text-secondary",
      bg: "bg-secondary-50",
      shadow: "shadow-secondary",
    },
    {
      title: "Categorías",
      value: String(categories.length),
      icon: FolderOpen,
      color: "text-primary",
      bg: "bg-primary-50",
      shadow: "shadow-primary",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-bounce-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-card-foreground">
          Hola, {user?.username || "Usuario"} 👋
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tu situación financiera
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className={`${stat.shadow}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div
                  className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Net Balance Card */}
      <Card className="shadow-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Balance neto
              </p>
              <p
                className={`text-4xl font-bold mt-1 ${
                  totalIncome - totalExpenses >= 0
                    ? "text-tertiary"
                    : "text-primary"
                }`}
              >
                {(totalIncome - totalExpenses).toFixed(2)} €
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpRight className="h-4 w-4 text-tertiary" />
                <span>{totalIncome.toFixed(2)} €</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <ArrowDownRight className="h-4 w-4 text-primary" />
                <span>{totalExpenses.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions + Monthly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-primary">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transacciones recientes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/transactions")}
            >
              Ver todas
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay transacciones recientes
              </p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: tx.category.color + "20" }}
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: tx.category.color }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{tx.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.transactionDate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          tx.transactionType.toUpperCase() === "INCOME"
                            ? "text-tertiary"
                            : "text-primary"
                        }`}
                      >
                        {tx.transactionType.toUpperCase() === "INCOME" ? "+" : "-"}
                        {tx.price?.toFixed(2)} €
                      </p>
                      <Badge
                        variant={
                          tx.transactionType.toUpperCase() === "INCOME"
                            ? "tertiary"
                            : "default"
                        }
                        className="text-[10px]"
                      >
                        {tx.transactionType.toUpperCase() === "INCOME" ? "Ingreso" : "Gasto"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Chart */}
        <Card className="shadow-secondary">
          <CardHeader>
            <CardTitle>Ingresos vs Gastos por mes</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay datos para mostrar
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-tertiary" />
                    <span>Ingresos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span>Gastos</span>
                  </div>
                </div>
                <div className="flex items-end gap-2 h-40">
                  {monthlyKeys.map((key) => {
                    const [m, y] = key.split("-");
                    const monthNum = parseInt(m, 10);
                    const incomeH = (monthlyData[key].income / maxMonthly) * 100;
                    const expenseH = (monthlyData[key].expense / maxMonthly) * 100;
                    return (
                      <div key={key} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex items-end gap-0.5 w-full" style={{ height: "120px" }}>
                          <div
                            className="flex-1 rounded-t-md bg-tertiary transition-all duration-500"
                            style={{ height: `${incomeH}%`, minHeight: incomeH > 0 ? "4px" : "0" }}
                            title={`Ingresos: ${monthlyData[key].income.toFixed(2)} €`}
                          />
                          <div
                            className="flex-1 rounded-t-md bg-primary transition-all duration-500"
                            style={{ height: `${expenseH}%`, minHeight: expenseH > 0 ? "4px" : "0" }}
                            title={`Gastos: ${monthlyData[key].expense.toFixed(2)} €`}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {MONTH_NAMES[monthNum] || m}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{y}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-tertiary">
        <CardContent className="p-6">
          <h3 className="font-bold text-card-foreground mb-4">
            Acciones rápidas
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/transactions")}>
              <Plus className="h-4 w-4" />
              Nueva Transacción
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/categories")}
            >
              <FolderOpen className="h-4 w-4" />
              Categorías
            </Button>
            <Button variant="outline" onClick={() => navigate("/debts")}>
              <CreditCard className="h-4 w-4" />
              Nueva Deuda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
