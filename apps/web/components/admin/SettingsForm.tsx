"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Restaurant {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  loyalty_streak_target: number;
  primary_color: string;
}

export function SettingsForm({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: restaurant.name,
    address: restaurant.address ?? "",
    phone: restaurant.phone ?? "",
    loyalty_streak_target: restaurant.loyalty_streak_target,
    primary_color: restaurant.primary_color,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
    setSuccess(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/restaurants/${restaurant.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save.");
    } else {
      setSuccess(true);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Restaurant info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Restaurant name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="color">Brand color</Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                id="color"
                type="color"
                value={form.primary_color}
                onChange={(e) => set("primary_color", e.target.value)}
                className="h-10 w-full sm:w-16 rounded border cursor-pointer"
              />
              <Input
                value={form.primary_color}
                onChange={(e) => set("primary_color", e.target.value)}
                className="font-mono w-full sm:w-32"
                maxLength={7}
              />
            </div>
            <p className="text-xs text-slate-500">
              Shown on your menu page. Default is green.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Loyalty program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="streak">
              Visits required to earn reward
            </Label>
            <Input
              id="streak"
              type="number"
              min={2}
              max={30}
              value={form.loyalty_streak_target}
              onChange={(e) => set("loyalty_streak_target", Number(e.target.value))}
            />
            <p className="text-xs text-slate-500">
              Customers earn a reward after this many visits to your restaurant.
            </p>
          </div>
        </CardContent>
      </Card>

      

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md">
          Settings saved.
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}


