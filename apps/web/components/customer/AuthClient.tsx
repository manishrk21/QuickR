"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Smartphone, 
  Mail, 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  UserX, 
  CircleAlert 
} from "lucide-react";

interface CustomerLoginProps {
  restaurantId: string;       // Resolved compiler mismatch
  restaurantName: string;
  slug: string;               // Resolved compiler mismatch
  tableId: string | null;     // Resolved compiler mismatch
  error: string;
  loading: boolean;
  phone: string;
  otp: string[];
  activeTab: "phone" | "gmail";
  step: "phone" | "otp";
  setPhone: (val: string) => void;
  setActiveTab: (val: "phone" | "gmail") => void;
  setStep: (val: "phone" | "otp") => void;
  handleSendOtp: (e: React.FormEvent) => void;
  handleVerifyOtp: (e: React.FormEvent) => void;
  handleOtpChange: (val: string, index: number) => void;
  handleGoogleLogin: () => void;
  handleGuestLogin: () => void;
}

export default function CustomerLoginPage({
  restaurantId,
  restaurantName,
  slug,
  tableId,
  error,
  loading,
  phone,
  otp,
  activeTab,
  step,
  setPhone,
  setActiveTab,
  setStep,
  handleSendOtp,
  handleVerifyOtp,
  handleOtpChange,
  handleGoogleLogin,
  handleGuestLogin
}: CustomerLoginProps) {
  

            
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
