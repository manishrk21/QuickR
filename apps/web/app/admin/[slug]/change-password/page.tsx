"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Clear must_change_password flag
    await supabase
      .from("tenant_members")
      .update({ must_change_password: false })
      .eq("user_id", (await supabase.auth.getUser()).data.user!.id);

    router.push(`/admin/${slug}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--sidebar-bg))]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-white tracking-tight">
            Quick<span className="text-violet-400">R</span>
          </span>
          <p className="mt-1 text-sm text-slate-400">Set your new password</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <h1 className="text-lg font-semibold text-slate-900 mb-2">
            Choose a password
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            This is your first login. Set a password you'll remember.
          </p>

          <form onSubmit={handleChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving…" : "Set password and continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
