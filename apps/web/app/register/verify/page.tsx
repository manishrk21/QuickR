// apps/web/app/register/verify/page.tsx
import Link from "next/link";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email ?? "your email";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#EDEBDE" }}
    >
      <Link
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight"
        style={{ color: "#630102" }}
      >
        Quick<span style={{ color: "#0d0000" }}>R</span>
      </Link>

      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-xl text-center"
        style={{ background: "#fff" }}
      >
        <div className="text-5xl mb-5">📬</div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Check your inbox
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed mb-2">
          We've sent a verification link to{" "}
          <span className="font-semibold text-slate-900">{email}</span>
        </p>

        <p className="text-sm text-slate-500 leading-relaxed">
          Click the link in the email to verify your address and activate your
          QuickR account. The link expires in 24 hours.
        </p>

        <div
          className="mt-6 rounded-xl px-4 py-3 text-xs text-left space-y-1"
          style={{ background: "#f8f4f0", color: "rgba(13,0,0,0.6)" }}
        >
          <p className="font-semibold text-slate-700">Can't find the email?</p>
          <p>• Check your spam or junk folder</p>
          <p>• Make sure you entered the right email address</p>
          <p>
            • Still stuck?{" "}
            <a
              href="mailto:mrk21creates@gmail.com"
              className="underline"
              style={{ color: "#630102" }}
            >
              Contact us
            </a>
          </p>
        </div>

        <Link
          href="/admin/login"
          className="inline-block mt-6 text-sm underline underline-offset-4"
          style={{ color: "#630102" }}
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
