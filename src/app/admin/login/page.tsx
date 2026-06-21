"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/api/admin";
import { setAuthToken } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginAdmin(email, password);
      setAuthToken(response.accessToken);
      router.push("/admin/banners");
    } catch {
      setError("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-yora-sand px-4">
      <div className="w-full max-w-md border border-yora-charcoal/10 bg-yora-cream p-8">
        <p className="font-display text-2xl tracking-[0.25em] text-yora-charcoal">
          YORA
        </p>
        <p className="mt-2 text-sm text-yora-muted">Acesso administrativo</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs tracking-widest text-yora-muted uppercase"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-yora-charcoal/20 bg-transparent px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs tracking-widest text-yora-muted uppercase"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-yora-charcoal/20 bg-transparent px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
