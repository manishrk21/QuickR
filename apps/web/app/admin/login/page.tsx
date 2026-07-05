"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Get their restaurant slug + check must_change_password
    const { data: member } = await supabase
      .from("tenant_members")
      .select("restaurant_id, must_change_password, restaurants(slug)")
      .eq("user_id", data.user.id)
      .single();

    if (!member) {
      setError("No restaurant linked to this account. Contact support.");
      setLoading(false);
      return;
    }

    const slug = (member.restaurants as any).slug;

    if (member.must_change_password) {
      router.push(`/admin/${slug}/change-password`);
    } else {
      router.push(`/admin/${slug}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--sidebar-bg))]">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-white tracking-tight">
            Quick<span className="text-violet-400">R</span>
          </span>
          <p className="mt-1 text-sm text-slate-400">Restaurant admin</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <h1 className="text-lg font-semibold text-slate-900 mb-6">Sign in</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Need access?{" "}
          <a href="mailto:support@quickr.in" className="text-violet-400 hover:underline">
            Contact QuickR support
          </a>
        </p>
      </div>
    </div>
  );
}
