import { useState, useEffect, useCallback } from "react";
import { categoryApi } from "@/api/category";
import type {
  CategoryResponseDTO,
  CategoryRequestDTO,
  PageCategoryResponseDTO,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PageHeader } from "@/components/layout/PageHeader";
import { CandyLoader } from "@/components/layout/CandyLoader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Plus, Pencil, Trash2, Loader2, Palette, FolderOpen } from "lucide-react";

const PAGE_SIZE = 10;

export function CategoriesPage() {
  const [data, setData] = useState<PageCategoryResponseDTO | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryResponseDTO | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#e040a0");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAll({ page, size: PAGE_SIZE });
      setData(res);
    } catch {
      // error handled by UI state
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditingCategory(null);
    setName("");
    setColor("#e040a0");
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (cat: CategoryResponseDTO) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload: CategoryRequestDTO = { name, color };
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, payload);
      } else {
        await categoryApi.insert(payload);
      }
      setDialogOpen(false);
      await fetchCategories();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      setFormError(
        axiosError.response?.data?.message || "Error al guardar la categoría"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteError(null);
    setDeleting(true);
    try {
      await categoryApi.delete(id);
      if (data && data.content.length === 1 && data.page > 0) {
        setPage(data.page - 1);
      } else {
        await fetchCategories();
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message =
        axiosError.response?.data?.message || "No se puede eliminar la categoría porque tiene transacciones asociadas.";
      setDeleteError(message);
    } finally {
      setDeleteConfirm(null);
      setDeleting(false);
    }
  };

  if (loading) {
    return <CandyLoader />;
  }

  return (
    <div className="animate-bounce-in space-y-6">
      <PageHeader
        title="Categorías"
        subtitle="Administra las categorías de tus transacciones"
        icon={FolderOpen}
        iconClass="bg-secondary-100 text-secondary"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nueva Categoría
          </Button>
        }
      />

      {!data || data.totalElements === 0 ? (
        <EmptyState
          icon={Palette}
          title="No hay categorías creadas"
          hint="Crea tu primera categoría para empezar"
        />
      ) : (
        <>
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.content.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  <div
                    className="h-8 w-8 rounded-full shadow-md ring-2 ring-white"
                    style={{ backgroundColor: cat.color }}
                  />
                </TableCell>
                <TableCell className="font-semibold">{cat.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(cat.id)}
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
        </div>

        <Pagination
          currentPage={data.page + 1}
          totalPages={data.totalPages}
          onPageChange={(p) => setPage(p - 1)}
        />

        <div className="text-center text-sm text-muted-foreground">
          Mostrando {data.content.length} de {data.totalElements} categorías
        </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            {formError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                placeholder="Ej: Alimentación"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-color">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="cat-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-10 rounded-full cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{color}</span>
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
                ) : editingCategory ? (
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
        onOpenChange={() => { setDeleteConfirm(null); setDeleteError(null); }}
      >
        <DialogContent onClose={() => { setDeleteConfirm(null); setDeleteError(null); }}>
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
          </DialogHeader>
          {deleteError ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center mt-2">
              {deleteError}
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">
              ¿Estás seguro de que quieres eliminar esta categoría? Esta acción no
              se puede deshacer.
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteConfirm(null); setDeleteError(null); }}
            >
              {deleteError ? "Cerrar" : "Cancelar"}
            </Button>
            {!deleteError && (
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Eliminar"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
