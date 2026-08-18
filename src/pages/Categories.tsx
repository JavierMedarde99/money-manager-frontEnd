import { useState, useEffect } from "react";
import { categoryApi } from "@/api/category";
import type { CategoryResponseDTO, CategoryRequestDTO } from "@/types";
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
import { Plus, Pencil, Trash2, Loader2, Palette } from "lucide-react";

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryResponseDTO | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#e040a0");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setName("");
    setColor("#e040a0");
    setDialogOpen(true);
  };

  const openEdit = (cat: CategoryResponseDTO) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: CategoryRequestDTO = { name, color };
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, payload);
      } else {
        await categoryApi.insert(payload);
      }
      setDialogOpen(false);
      await fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await categoryApi.delete(id);
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-bounce-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">
            Categorías
          </h1>
          <p className="text-muted-foreground">
            Administra las categorías de tus transacciones
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Palette className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No hay categorías creadas</p>
          <p className="text-sm">Crea tu primera categoría para empezar</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  <div
                    className="h-8 w-8 rounded-full shadow-md"
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
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent onClose={() => setDeleteConfirm(null)}>
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mt-2">
            ¿Estás seguro de que quieres eliminar esta categoría? Esta acción no
            se puede deshacer.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
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
