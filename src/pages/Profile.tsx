import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/layout/PageHeader";
import { User, Mail, Lock, Save, Trash2, Loader2 } from "lucide-react";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading, updateProfile, deleteAccount } = useAuthStore();

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
  }>({});

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setSuccess("");

    const errors: { username?: string; email?: string } = {};
    if (!username.trim()) errors.username = "El usuario es obligatorio";
    if (!email.trim()) errors.email = "El email es obligatorio";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const payload: { username: string; email: string; password?: string } = {
        username: username.trim(),
        email: email.trim(),
      };
      if (password.trim()) payload.password = password.trim();
      await updateProfile(payload);
      setPassword("");
      setSuccess("Perfil actualizado correctamente");
    } catch {
      // error is set in store
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      navigate("/login");
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-bounce-in">
      <PageHeader
        title="Mi Perfil"
        subtitle="Gestiona tu cuenta"
        icon={User}
        iconClass="bg-tertiary-100 text-tertiary"
      />

      {/* Profile info */}
      <Card className="hero-gradient relative overflow-hidden border-0 shadow-primary">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/15 animate-float-slow" />
        <div className="absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-white/10 animate-float-slow" style={{ animationDelay: "1.3s" }} />
        <CardContent className="p-6 relative">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-white/50">
              <AvatarFallback className="text-xl bg-white/20 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display text-2xl font-bold text-white">
                {user?.username}
              </p>
              <p className="text-sm text-white/80">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card className="card-gloss">
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Editar información
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            {success && (
              <div className="rounded-full bg-green-50 border border-green-200 p-3 text-sm text-green-600 text-center">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
              {fieldErrors.username && (
                <p className="text-xs text-red-500">{fieldErrors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña (opcional)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <PasswordInput
                  id="password"
                  placeholder="Dejar vacío para no cambiar"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200 bg-red-50/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-bold text-red-600">Eliminar cuenta</p>
              <p className="text-sm text-muted-foreground">
                Esta acción es irreversible. Se borrarán todos tus datos.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClose={() => setShowDeleteDialog(false)}>
          <DialogHeader>
            <DialogTitle>¿Eliminar tu cuenta?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminarán permanentemente
              todos tus datos incluyendo transacciones, categorías y deudas.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sí, eliminar mi cuenta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
