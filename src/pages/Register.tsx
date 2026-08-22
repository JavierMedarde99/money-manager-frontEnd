import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { DollarSign, Loader2 } from "lucide-react";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres").max(50),
  email: z.string().email("Email no válido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const result = registerSchema.safeParse({ username, email, password, confirmPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    try {
      await register({ username, email, password });
      navigate("/");
    } catch {
      // error is set in store
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-bounce-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-primary">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Money Manager</h1>
        </div>

        <Card className="shadow-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <CardDescription>Regístrate para empezar a gestionar tu dinero</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-full bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center">
                  {error}
                  <button
                    type="button"
                    onClick={clearError}
                    className="ml-2 font-bold"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  placeholder="Elige un usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                {fieldErrors.username && (
                  <p className="text-xs text-red-500">{fieldErrors.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500">{fieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Elige una contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-500">{fieldErrors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
