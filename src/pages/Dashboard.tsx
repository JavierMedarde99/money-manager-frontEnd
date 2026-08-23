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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface PieData {
  name: string;
  value: number;
  color: string;
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionResponseDTO[]>([]);
  const [debts, setDebts] = useState<DebtResponseDTO[]>([]);
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthStr = String(selectedMonth + 1).padStart(2, "0");
  const currentMonth = `${selectedYear}-${monthStr}`;
  const monthFirstDay = `${currentMonth}-01`;
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthLastDay = `${currentMonth}-${String(lastDay).padStart(2, "0")}`;

  useEffect(() => {
    async function load() {
      try {
        const [txData, debtData, catData] = await Promise.all([
          transactionApi.getAll({ page: 0, size: 200, from: monthFirstDay, to: monthLastDay }),
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
  }, [monthFirstDay, monthLastDay]);

  const totalIncome = transactions
    .filter((t) => t.transactionType.toUpperCase() === "INCOME")
    .reduce((sum, t) => sum + (t.price || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.transactionType.toUpperCase() === "EXPENSE")
    .reduce((sum, t) => sum + (t.price || 0), 0);

  const debtsThisMonth = debts.filter((d) =>
    d.payments?.some((p) => {
      const parts = p.paymentDate.split("-");
      if (parts.length === 3) {
        const payMonth = `${parts[0]}-${parts[1]}`;
        return payMonth === currentMonth;
      }
      return p.paymentDate.substring(0, 7) === currentMonth;
    })
  );

  const totalDebt = debtsThisMonth.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaid = debtsThisMonth.reduce(
    (sum, d) => sum + (d.payments?.reduce((ps, p) => ps + p.amount, 0) || 0),
    0
  );
  const remainingDebt = totalDebt - totalPaid;

  const recentTransactions = [...transactions]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const incomePieData: PieData[] = Object.values(
    transactions
      .filter((t) => t.transactionType.toUpperCase() === "INCOME")
      .reduce(
        (acc, t) => {
          const key = t.category.name;
          if (!acc[key])
            acc[key] = { name: key, value: 0, color: t.category.color };
          acc[key].value += Math.abs(t.price || 0);
          return acc;
        },
        {} as Record<string, PieData>
      )
  );

  const expensesPieData: PieData[] = Object.values(
    transactions
      .filter((t) => t.transactionType.toUpperCase() === "EXPENSE")
      .reduce(
        (acc, t) => {
          const key = t.category.name;
          if (!acc[key])
            acc[key] = { name: key, value: 0, color: t.category.color };
          acc[key].value += Math.abs(t.price || 0);
          return acc;
        },
        {} as Record<string, PieData>
      )
  );

  const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const selectedMonthName = MONTH_NAMES[selectedMonth];
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y: number) => y - 1);
    } else {
      setSelectedMonth((m: number) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y: number) => y + 1);
    } else {
      setSelectedMonth((m: number) => m + 1);
    }
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

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
        <div className="flex items-center gap-3 mt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevMonth}
            className="h-8 w-8 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-muted-foreground font-medium min-w-[180px] text-center">
            Resumen de {selectedMonthName} {selectedYear}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isCurrentMonth && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentMonth}
              className="rounded-full text-xs"
            >
              Hoy
            </Button>
          )}
        </div>
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

      {/* Pie Charts: Income + Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Pie Chart */}
        <Card className="shadow-tertiary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-tertiary" />
              Ingresos por categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomePieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay ingresos registrados
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {incomePieData.map((entry, index) => (
                      <Cell key={`income-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(2)} €`,
                      "Importe",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Expenses Pie Chart */}
        <Card className="shadow-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Gastos por categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesPieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay gastos registrados
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {expensesPieData.map((entry, index) => (
                      <Cell key={`expense-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(2)} €`,
                      "Importe",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions - Full Width */}
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
                      {tx.transactionType.toUpperCase() === "INCOME"
                        ? "+"
                        : "-"}
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
                      {tx.transactionType.toUpperCase() === "INCOME"
                        ? "Ingreso"
                        : "Gasto"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
