import { useState, useEffect, useCallback } from "react";
import { transactionApi } from "@/api/transaction";
import { categoryApi } from "@/api/category";
import type {
  TransactionResponseDTO,
  TransactionRequestDTO,
  TransactionFilters,
  CategoryResponseDTO,
  PageTransactionResponseDTO,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowRightLeft,
  Filter,
  X,
} from "lucide-react";

const TRANSACTION_TYPES = [
  { value: "INCOME", label: "Ingreso" },
  { value: "EXPENSE", label: "Gasto" },
];

const TRANSACTION_SUBTYPES = [
  { value: "FIXED", label: "Fijo" },
  { value: "VARIABLE", label: "Variable" },
];

function toBackendDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y}`;
}

function fromBackendDate(backendDate: string): string {
  if (!backendDate) return "";
  const [d, m, y] = backendDate.split("-");
  return `${y}-${m}-${d}`;
}

export function TransactionsPage() {
  const [data, setData] = useState<PageTransactionResponseDTO | null>(null);
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionResponseDTO | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 0,
    size: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [amount, setAmount] = useState("1");
  const [price, setPrice] = useState("0");
  const [transactionType, setTransactionType] = useState("EXPENSE");
  const [transactionSubtype, setTransactionSubtype] = useState("VARIABLE");
  const [categoryId, setCategoryId] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilters = {
        ...filters,
        from: filters.from ? toBackendDate(filters.from) : undefined,
        to: filters.to ? toBackendDate(filters.to) : undefined,
      };
      const [transactionData, categoryData] = await Promise.all([
        transactionApi.getAll(apiFilters),
        categoryApi.getAll(),
      ]);
      setData(transactionData);
      setCategories(categoryData);
      if (categoryId === 0 && categoryData.length > 0) {
        setCategoryId(categoryData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setAmount("1");
    setPrice("0");
    setTransactionType("INCOME");
    setTransactionSubtype("VARIABLE");
    setFormError(null);
    if (categories.length > 0) setCategoryId(categories[0].id);
    setDialogOpen(true);
  };

  const openEdit = (tx: TransactionResponseDTO) => {
    setEditing(tx);
    setName(tx.name);
    setTransactionDate(fromBackendDate(tx.transactionDate));
    setAmount(String(tx.amount || 1));
    setPrice(String(tx.price || 0));
    setTransactionType(tx.transactionType.toUpperCase());
    setTransactionSubtype(tx.transactionSubtype.toUpperCase());
    setCategoryId(tx.category.id);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (!selectedCategory) return;

    const payload: TransactionRequestDTO = {
      name,
      transactionDate: toBackendDate(transactionDate),
      amount: parseInt(amount, 10) || 0,
      price: parseFloat(price) || 0,
      transactionType,
      transactionSubtype,
      category: selectedCategory,
    };

    try {
      if (editing) {
        await transactionApi.update(editing.id, payload);
      } else {
        await transactionApi.insert(payload);
      }
      setDialogOpen(false);
      await fetchData();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      setFormError(
        axiosError.response?.data?.message || "Error al guardar la transacción"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await transactionApi.delete(id);
      await fetchData();
    } catch {
      // silent
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 0,
    }));
  };

  const clearFilters = () => {
    setFilters({ page: 0, size: 10 });
  };

  const hasActiveFilters = filters.type || filters.subType || filters.from || filters.to;

  return (
    <div className="animate-bounce-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">
            Transacciones
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus ingresos y gastos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? "border-primary text-primary" : ""}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                !
              </Badge>
            )}
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nueva
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-primary animate-bounce-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Filtros de búsqueda</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3 w-3" />
                Limpiar
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Select
                options={TRANSACTION_TYPES}
                placeholder="Todos"
                value={filters.type || ""}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Subtipo</Label>
              <Select
                options={TRANSACTION_SUBTYPES}
                placeholder="Todos"
                value={filters.subType || ""}
                onChange={(e) => handleFilterChange("subType", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Desde</Label>
              <Input
                type="date"
                value={filters.from || ""}
                onChange={(e) => handleFilterChange("from", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hasta</Label>
              <Input
                type="date"
                value={filters.to || ""}
                onChange={(e) => handleFilterChange("to", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ArrowRightLeft className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No hay transacciones</p>
          <p className="text-sm">
            {hasActiveFilters
              ? "Prueba a cambiar los filtros de búsqueda"
              : "Crea tu primera transacción para empezar"}
          </p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Subtipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-semibold">{tx.name}</TableCell>
                  <TableCell>{tx.transactionDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tx.transactionType.toUpperCase() === "INCOME" ? "tertiary" : "default"
                      }
                    >
                      {tx.transactionType.toUpperCase() === "INCOME" ? "Ingreso" : "Gasto"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {tx.transactionSubtype.toUpperCase() === "FIXED"
                        ? "Fijo"
                        : "Variable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tx.category.color }}
                      />
                      {tx.category.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{tx.amount}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {tx.price.toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(tx)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(tx.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={data.page + 1}
            totalPages={data.totalPages}
            onPageChange={(page) =>
              setFilters((prev) => ({ ...prev, page: page - 1 }))
            }
          />

          <div className="text-center text-sm text-muted-foreground">
            Mostrando {data.content.length} de {data.totalElements} transacciones
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Transacción" : "Nueva Transacción"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            {formError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="tx-name">Nombre</Label>
              <Input
                id="tx-name"
                placeholder="Ej: Compra supermercado"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tx-date">Fecha</Label>
                <Input
                  id="tx-date"
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-category">Categoría</Label>
                <Select
                  id="tx-category"
                  options={categories.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                  value={String(categoryId)}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tx-type">Tipo</Label>
                <Select
                  id="tx-type"
                  options={TRANSACTION_TYPES}
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-subtype">Subtipo</Label>
                <Select
                  id="tx-subtype"
                  options={TRANSACTION_SUBTYPES}
                  value={transactionSubtype}
                  onChange={(e) => setTransactionSubtype(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tx-amount">Cantidad</Label>
                <Input
                  id="tx-amount"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-price">Precio (€)</Label>
                <Input
                  id="tx-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editing ? (
                  "Guardar"
                ) : (
                  "Crear"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent onClose={() => setDeleteConfirm(null)}>
          <DialogHeader>
            <DialogTitle>Eliminar Transacción</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mt-2">
            ¿Estás seguro de que quieres eliminar esta transacción? Esta acción
            no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
