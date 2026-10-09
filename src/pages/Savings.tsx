import { useState, useEffect, useCallback } from "react";
import { savingsApi } from "@/api/savings";
import type { SavingsResponseDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { CandyLoader } from "@/components/layout/CandyLoader";
import { EmptyState } from "@/components/layout/EmptyState";
import {
  PiggyBank,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function SavingsPage() {
  const [savings, setSavings] = useState<SavingsResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const fetchSavings = useCallback(async () => {
    try {
      const data = await savingsApi.getAll();
      setSavings(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  const handleRetry = () => {
    setLoading(true);
    fetchSavings();
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const yearsAsc = [...new Set(savings.map((s) => s.year))].sort(
    (a, b) => a - b
  );
  const year =
    selectedYear ??
    (yearsAsc.includes(currentYear) ? currentYear : (yearsAsc.at(-1) ?? currentYear));
  const yearMin = yearsAsc[0];
  const yearMax = yearsAsc.at(-1) ?? year;
  const yearMonths = savings
    .filter((s) => s.year === year)
    .sort((a, b) => a.month - b.month);
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const entry = yearMonths.find((s) => s.month === i + 1);
    return {
      month: MONTH_NAMES[i].slice(0, 3),
      savings: entry ? entry.savings : null,
    };
  });

  const goToPrevYear = () =>
    setSelectedYear((prev) => Math.max((prev ?? year) - 1, yearMin ?? year));
  const goToNextYear = () =>
    setSelectedYear((prev) => Math.min((prev ?? year) + 1, yearMax));
  const showToday = yearsAsc.includes(currentYear) && year !== currentYear;

  if (loading) {
    return <CandyLoader />;
  }

  return (
    <div className="animate-bounce-in space-y-8">
      <PageHeader
        title="Ahorros"
        subtitle={`Resumen de ${year}`}
        icon={PiggyBank}
        actions={
          <div className="flex items-center gap-1 rounded-full bg-card border border-border shadow-soft p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevYear}
              disabled={yearsAsc.length === 0 || year === yearMin}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold px-2 min-w-[150px] text-center">
              {year}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextYear}
              disabled={yearsAsc.length === 0 || year === yearMax}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {showToday && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedYear(currentYear)}
                className="rounded-full text-xs"
              >
                Hoy
              </Button>
            )}
          </div>
        }
      />
      {error ? (
        <div className="text-center py-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            Error al cargar los ahorros
          </p>
          <Button onClick={handleRetry}>Reintentar</Button>
        </div>
      ) : savings.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Sin datos de ahorros"
          hint="Registra ingresos y gastos para ver tu ahorro aquí"
        />
      ) : (
        <>
        <Card className="card-gloss">
          <CardHeader>
            <CardTitle className="font-display">
              Ahorro mensual — {year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/50"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${Number(v).toFixed(0)}€`}
                    width={56}
                  />
                  <Tooltip
                    formatter={(value) => `${Number(value).toFixed(2)} €`}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  <Bar dataKey="savings" radius={[8, 8, 0, 0]}>
                    {chartData.map((d) => (
                      <Cell
                        key={d.month}
                        fill={
                          d.savings !== null && d.savings < 0
                            ? "var(--color-primary)"
                            : "var(--color-secondary)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gloss">
          <CardHeader>
            <CardTitle className="font-display">
              Ahorro por mes — {year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {yearMonths.length === 0 ? (
              <EmptyState
                icon={PiggyBank}
                title="Sin datos de ahorros"
                hint={`No hay registros para ${year}`}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                    <TableHead className="text-right">Gastos</TableHead>
                    <TableHead className="text-right">Ahorro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearMonths.map((s) => (
                    <TableRow key={`${s.year}-${s.month}`}>
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          {MONTH_NAMES[s.month - 1] ?? String(s.month)}
                          {s.year === currentYear &&
                            s.month === now.getMonth() + 1 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                Actual
                              </Badge>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {s.totalIncome.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right">
                        {s.totalExpense.toFixed(2)} €
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold",
                          s.savings < 0 && "text-primary"
                        )}
                      >
                        {s.savings.toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
