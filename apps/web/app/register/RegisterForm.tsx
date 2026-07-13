// apps/web/app/register/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    cafe_name: "",
    owner_name: "",
    mobile: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setGlobalError("");
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.cafe_name.trim()) newErrors.cafe_name = "Cafe name is required";
    if (form.cafe_name.trim().length < 2) newErrors.cafe_name = "Must be at least 2 characters";
    if (!form.owner_name.trim()) newErrors.owner_name = "Owner name is required";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) newErrors.mobile = "Enter a valid 10-digit Indian mobile number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Enter a valid email address";
    if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!/[A-Z]/.test(form.password)) newErrors.password = "Include at least one uppercase letter";
    if (!/[0-9]/.test(form.password)) newErrors.password = "Include at least one number";
    if (form.password !== form.confirm_password) newErrors.confirm_password = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError("");

    const slug = slugify(form.cafe_name);

    // Sign up with Supabase Auth
    // We store registration data in user_metadata so the callback API can use it
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/complete-registration`,
        data: {
          cafe_name:  form.cafe_name.trim(),
          owner_name: form.owner_name.trim(),
          mobile:     form.mobile,
          slug:       slug,
          role:       "restaurant_owner",
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setGlobalError("An account with this email already exists. Sign in instead.");
      } else {
        setGlobalError(error.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      // Redirect to "check your email" page
      router.push(`/register/verify?email=${encodeURIComponent(form.email)}`);
    }
  }

  const inputClass = (field: string) =>
    `w-full ${errors[field] ? "border-red-400 focus:border-red-400" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* Cafe name */}
      <div className="space-y-1.5">
        <Label htmlFor="cafe_name">
          Cafe / Restaurant name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="cafe_name"
          placeholder="The Sunrise Cafe"
          value={form.cafe_name}
          onChange={(e) => set("cafe_name", e.target.value)}
          className={inputClass("cafe_name")}
          required
        />
        {form.cafe_name && (
          <p className="text-xs text-slate-400">
            Your menu URL:{" "}
            <span className="font-mono text-slate-600">
              quickrdine.app/r/{slugify(form.cafe_name) || "your-cafe"}
            </span>
          </p>
        )}
        {errors.cafe_name && (
          <p className="text-xs text-red-500">{errors.cafe_name}</p>
        )}
      </div>

      {/* Owner name */}
      <div className="space-y-1.5">
        <Label htmlFor="owner_name">
          Owner name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="owner_name"
          placeholder="Ravi Kumar"
          value={form.owner_name}
          onChange={(e) => set("owner_name", e.target.value)}
          className={inputClass("owner_name")}
          required
        />
        {errors.owner_name && (
          <p className="text-xs text-red-500">{errors.owner_name}</p>
        )}
      </div>

      {/* Mobile */}
      <div className="space-y-1.5">
        <Label htmlFor="mobile">
          Mobile number <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <span className="flex items-center px-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm shrink-0">
            +91
          </span>
          <Input
            id="mobile"
            type="tel"
            inputMode="numeric"
            placeholder="9876543210"
            value={form.mobile}
            onChange={(e) =>
              set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            className={`flex-1 ${errors.mobile ? "border-red-400" : ""}`}
            required
          />
        </div>
        {errors.mobile && (
          <p className="text-xs text-red-500">{errors.mobile}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">
          Email address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="owner@yourcafe.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className={inputClass("email")}
          required
        />
        <p className="text-xs text-slate-400">
          We'll send a verification link to this address
        </p>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password">
          Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className={`pr-10 ${errors.password ? "border-red-400" : ""}`}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirm_password">
          Confirm password <span className="text-red-500">*</span>
        </Label>
        <Input
          id="confirm_password"
          type="password"
          placeholder="Re-enter password"
          value={form.confirm_password}
          onChange={(e) => set("confirm_password", e.target.value)}
          className={inputClass("confirm_password")}
          required
        />
        {errors.confirm_password && (
          <p className="text-xs text-red-500">{errors.confirm_password}</p>
        )}
      </div>

      {/* Global error */}
      {globalError && (
        <div className="rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-100">
          {globalError}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-11 text-sm font-semibold"
        style={{ background: "#630102", color: "#EDEBDE" }}
        disabled={loading}
      >
        {loading ? "Creating your account…" : "Create account & verify email"}
      </Button>

      <p className="text-xs text-center text-slate-400">
        By signing up you agree to our{" "}
        <a href="/privacy" className="underline underline-offset-4" style={{ color: "#630102" }}>
          Privacy Policy
        </a>
      </p>
    </form>
  );
}
