import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { DollarSign, Loader2, PieChart, CreditCard, Sparkles } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres").max(50),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

const features = [
  {
    icon: PieChart,
    title: "Panel visual",
    text: "Ingresos y gastos con gráficos de colores",
  },
  {
    icon: CreditCard,
    title: "Deudas bajo control",
    text: "Registra pagos y sigue tu progreso",
  },
  {
    icon: Sparkles,
    title: "Categorías a tu estilo",
    text: "Colores personalizados para cada gasto",
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      const errors: { username?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as "username" | "password";
        errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    try {
      await login({ username, password });
      navigate("/");
    } catch {
      // error is set in store
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Hero panel */}
      <div className="hero-gradient hidden lg:flex relative overflow-hidden flex-col justify-between p-12 w-[46%]">
        {/* Decorative blobs */}
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-white/15 blur-2xl animate-float-slow" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-tertiary/40 blur-3xl animate-float-slow" style={{ animationDelay: "1.2s" }} />
        <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-secondary/50 blur-3xl animate-float-slow" style={{ animationDelay: "2.4s" }} />
        <div className="absolute top-8 right-10 h-16 w-16 rounded-full border-4 border-white/20 animate-float-slow" style={{ animationDelay: "0.8s" }} />
        <div className="absolute bottom-16 right-1/3 h-8 w-8 rounded-full bg-white/30 animate-float-slow" style={{ animationDelay: "1.6s" }} />

        <div className="relative flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-white leading-none">
              Money Manager
            </p>
            <p className="text-xs text-white/70 font-medium tracking-widest uppercase mt-1">
              Candy 2.0
            </p>
          </div>
        </div>

        <div className="relative">
          <h2 className="font-display text-5xl font-bold text-white leading-[1.08] tracking-tight">
            Tu dinero,
            <br />
            con dulzura.
          </h2>
          <p className="text-white/80 text-lg mt-4 max-w-sm">
            Gestiona ingresos, gastos y deudas en una interfaz que da gusto
            usar cada día.
          </p>

          <div className="mt-10 space-y-5">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 animate-fade-up"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-bold text-white">
                    {feature.title}
                  </p>
                  <p className="text-sm text-white/70">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">
          Money Manager · Diseñado con cariño en España 🍬
        </p>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        {/* Floating decorative dots for mobile */}
        <div className="lg:hidden absolute top-10 right-10 h-24 w-24 rounded-full bg-primary/10 blur-xl animate-float-slow" />
        <div className="lg:hidden absolute bottom-16 left-8 h-32 w-32 rounded-full bg-tertiary/10 blur-xl animate-float-slow" style={{ animationDelay: "1.5s" }} />

        <div className="w-full max-w-md animate-bounce-in relative">
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="h-12 w-12 rounded-2xl btn-gradient flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gradient">
              Money Manager
            </h1>
          </div>

          <Card className="card-gloss p-2">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-display text-3xl text-gradient">
                Iniciar Sesión
              </CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
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
                    placeholder="Tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  {fieldErrors.username && (
                    <p className="text-xs text-red-500">{fieldErrors.username}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <PasswordInput
                    id="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500">{fieldErrors.password}</p>
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
                    "Entrar"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <Link
                    to="/register"
                    className="text-primary font-semibold hover:underline"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
