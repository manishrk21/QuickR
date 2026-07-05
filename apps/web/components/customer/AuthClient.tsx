"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface AuthClientProps {
  restaurantId: string;
  restaurantName: string;
  slug: string;
  tableId: string | null;
}

export default function AuthClient({ restaurantId, restaurantName, slug, tableId }: AuthClientProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"phone" | "gmail">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Send OTP Flow
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP.");

      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // 2. Verify OTP Flow
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: fullOtp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP.");

      const sessionRes = await fetch("/api/customer/mobile-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId, table_id: tableId, mobile: phone }),
      });

      if (sessionRes.ok) {
        window.location.href = `/r/${slug}`;
      } else {
        throw new Error("Failed to initialize session.");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  // 3. Google OAuth Flow
  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?slug=${slug}&tableId=${tableId || ""}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
      setLoading(false);
    }
  }

  // 4. Guest Flow
  // async function handleGuestLogin() {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const res = await fetch("/api/customer/guest-session", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ restaurant_id: restaurantId, table_id: tableId }),
  //     });

  //     if (res.ok) {
  //       window.location.href = `/r/${slug}`;
  //     } else {
  //       throw new Error("Failed to join as guest.");
  //     }
  //   } catch (err: any) {
  //     setError(err.message || "Something went wrong.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  // apps/web/components/customer/AuthClient.tsx

async function handleGuestLogin() {
  setLoading(true);
  setError(null);

  // 1. Explicitly get the table ID from the browser's cookies
  const cookies = document.cookie.split(';');
  const tableCookie = cookies.find(c => c.trim().startsWith('qr_table='));
  const extractedTableId = tableCookie ? tableCookie.split('=')[1] : tableId;

  try {
    const res = await fetch("/api/customer/guest-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        restaurant_id: restaurantId, 
        table_id: extractedTableId // Send the extracted ID explicitly
      }),
    });

    if (res.ok) {
      window.location.href = `/r/${slug}`;
    } else {
      throw new Error("Failed to join as guest.");
    }
  } catch (err: any) {
    setError(err.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
}


  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <Card className="w-full max-w-md p-4 shadow-md bg-white border border-slate-100">
        {/* 1. Welcome Header */}
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to {restaurantName}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          {/* 2. Custom Selector Tabs */}
          <div className="flex w-full border-b border-slate-200 text-center font-medium">
            <button
              onClick={() => { setActiveTab("phone"); setStep("phone"); }}
              className={`w-1/2 pb-2 text-base transition-colors ${activeTab === "phone" ? "border-b-2 border-slate-900 text-slate-900 font-bold" : "text-slate-400"}`}
            >
              Phone
            </button>
            <button
              onClick={() => setActiveTab("gmail")}
              className={`w-1/2 pb-2 text-base transition-colors ${activeTab === "gmail" ? "border-b-2 border-slate-900 text-slate-900 font-bold" : "text-slate-400"}`}
            >
              Gmail login
            </button>
          </div>

          {/* 3. Promo Subtext (always visible below tabs) */}
          <div className="text-center text-sm font-semibold text-amber-600 tracking-wide bg-amber-50/60 py-1.5 rounded-md">
            ✨ Log in to get rewards and order
          </div>

          {/* 4. Main Tab Interface Content Boxes */}
          {activeTab === "phone" ? (
            <div className="w-full">
              {step === "phone" ? (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-semibold">+91</span>
                    <Input
                      type="tel"
                      placeholder="Enter 10 digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="pl-12 text-base h-11"
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
                    {loading ? "Sending..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 text-center">
                    <span className="text-xs text-slate-400">Verifying +91 {phone}</span>
                    <div className="flex justify-between gap-2 max-w-xs mx-auto w-full">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          className="w-10 h-12 text-center text-lg font-bold p-0 border-slate-300"
                          disabled={loading}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                      {loading ? "Verifying..." : "Verify OTP"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setStep("phone")} disabled={loading} className="text-slate-400">
                      Back to Change Number
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="w-full py-2">
              <Button 
                variant="outline" 
                className="w-full h-11 text-base flex items-center justify-center gap-2 border-slate-300 hover:bg-slate-50"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                🌐 Log in with Google
              </Button>
            </div>
          )}

          {/* 5. Horizontal Divider Section */}
          <div className="relative flex py-2 items-center text-xs text-slate-300 uppercase font-semibold">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400">Or Continue As</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* 6. Guest Option (Always locked at bottom) */}
          <div className="w-full">
            <Button 
              variant="secondary"
              onClick={handleGuestLogin} 
              className="w-full h-11 text-base font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border-0" 
              disabled={loading}
            >
              Guest / no login needed
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
