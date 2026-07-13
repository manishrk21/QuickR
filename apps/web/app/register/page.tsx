// apps/web/app/register/page.tsx
import { RegisterForm } from "./RegisterForm";
import Link from "next/link";

export const metadata = {
  title: "Register your restaurant — QuickR",
};

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#EDEBDE" }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight"
        style={{ color: "#630102" }}
      >
        Quick<span style={{ color: "#0d0000" }}>R</span>
        <span className="text-sm font-normal ml-2" style={{ color: "rgba(13,0,0,0.5)" }}>
          Dine
        </span>
      </Link>

      <div className="w-full max-w-lg">
        <div
          className="rounded-2xl p-8 shadow-xl"
          style={{ background: "#fff" }}
        >
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            List your restaurant
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Get QuickR for your cafe or restaurant. Setup takes 5 minutes.
          </p>

          <RegisterForm />
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "rgba(13,0,0,0.5)" }}>
          Already have an account?{" "}
          <Link
            href="/admin/login"
            className="underline underline-offset-4"
            style={{ color: "#630102" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
