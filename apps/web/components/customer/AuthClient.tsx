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
  restaurantName: string;
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
  restaurantName,
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#FAF9F5]">
      <Card className="w-full max-w-md border border-[#630102]/10 bg-[#EDEBDE] shadow-[0_8px_30px_rgb(0,0,0,0.03)] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        
        {/* 1. Welcome Header */}
        <CardHeader className="text-center pt-8 pb-4 border-b border-[#630102]/5 bg-white/40">
          <CardTitle className="text-2xl font-bold tracking-tight text-[#0d0000] font-serif" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
            Welcome to {restaurantName}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
          
          {error && (
            <div className="flex gap-2.5 items-start text-xs font-medium text-red-800 bg-red-50 border border-red-200/60 p-3.5 rounded-xl shadow-sm animate-in fade-in-50 duration-200">
              <CircleAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <p className="leading-normal flex-1 text-left">{error}</p>
            </div>
          )}

          {/* 2. Premium Segmented Tabs */}
          <div className="flex w-full bg-white/60 p-1 rounded-xl border border-[#630102]/10 text-center font-medium text-sm">
            <button 
              type="button"
              onClick={() => { setActiveTab("phone"); setStep("phone"); }} 
              className={`flex-1 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === "phone" ? "bg-[#630102] text-white font-semibold shadow-sm" : "text-[#0d0000]/50 hover:text-[#0d0000]/80"}`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Mobile OTP</span>
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("gmail")} 
              className={`flex-1 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === "gmail" ? "bg-[#630102] text-white font-semibold shadow-sm" : "text-[#0d0000]/50 hover:text-[#0d0000]/80"}`}
            >
              <Mail className="h-4 w-4" />
              <span>Gmail Login</span>
            </button>
          </div>

          {/* 3. Promo Banner Subtext */}
          <div className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-amber-900 tracking-wide bg-amber-100/70 border border-amber-200/50 py-2.5 px-4 rounded-xl">
            <Sparkles className="h-3.5 w-3.5 text-amber-700 shrink-0 animate-pulse" />
            <span>Unlock instant loyalty milestones & scratch rewards on checkout</span>
          </div>

          {/* 4. Tab Interfaces */}
          {activeTab === "phone" ? (
            <div className="w-full animate-in fade-in-40 duration-200">
              {step === "phone" ? (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone-input" className="text-xs font-semibold uppercase tracking-wider text-[#0d0000]/60">
                      Phone Identification
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-[#0d0000]/40 text-sm font-mono font-bold select-none border-r border-[#630102]/10 pr-2.5">
                        +91
                      </span>
                      <Input 
                        id="phone-input"
                        type="tel" 
                        placeholder="Enter 10 digit number" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                        className="pl-16 text-base h-11 border-[#630102]/15 bg-white/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/10 focus:border-[#630102] rounded-xl tracking-wider font-mono text-[#0d0000]" 
                        disabled={loading} 
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-sm font-semibold bg-[#630102] hover:bg-[#400102] text-white rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Requesting Token...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="h-4 w-4 opacity-80" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 text-center">
                    <span className="text-xs font-medium text-[#0d0000]/60 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#630102]/60" />
                      Code transmitted to +91 {phone}
                    </span>
                    
                    {/* High Contrast Precise OTP Grid */}
                    <div className="flex justify-between gap-2 max-w-xs mx-auto w-full pt-1">
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
                          className="w-12 h-14 text-center text-xl font-bold p-0 border-[#630102]/15 bg-white/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/20 focus:border-[#630102] rounded-xl text-[#0d0000] font-mono shadow-inner shadow-black/[0.01]" 
                          disabled={loading} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-sm font-semibold bg-[#630102] hover:bg-[#400102] text-white rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Authorizing Terminals...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify Secure OTP</span>
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setStep("phone")} 
                      disabled={loading} 
                      className="text-xs text-[#0d0000]/50 hover:text-[#0d0000]/80 hover:bg-[#630102]/5 rounded-lg"
                    >
                      Modify Phone Core Reference
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="w-full py-1 animate-in fade-in-40 duration-200">
              <Button 
                variant="outline" 
                className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 border-[#630102]/15 bg-white/60 text-[#0d0000] hover:bg-white transition-all focus:ring-2 focus:ring-[#630102]/10 rounded-xl shadow-sm group" 
                onClick={handleGoogleLogin} 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                <span>Authenticate via Google Workspace</span>
              </Button>
            </div>
          )}

          {/* 5. Horizontal Divider Section */}
          <div className="relative flex items-center my-1">
            <div className="flex-grow border-t border-[#630102]/10"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-bold tracking-widest text-[#0d0000]/30 bg-[#EDEBDE] px-2">
              Neutral Intermediary State
            </span>
            <div className="flex-grow border-t border-[#630102]/10"></div>
          </div>

          {/* 6. Guest Option */}
          <Button 
            type="button"
            variant="ghost" 
            className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 border border-dashed border-[#630102]/20 hover:border-[#630102]/40 hover:bg-[#630102]/5 text-[#630102] rounded-xl transition-all"
            onClick={handleGuestLogin}
            disabled={loading}
          >
            <UserX className="h-4 w-4 shrink-0" />
            <span>Proceed Anonymously as Guest</span>
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}

            
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
//       <Card className="w-full max-w-md p-4 shadow-md bg-white border border-slate-100">
//         {/* 1. Welcome Header */}
//         <CardHeader className="text-center pb-2">
//           <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
//             Welcome to {restaurantName}
//           </CardTitle>
//         </CardHeader>
        
//         <CardContent className="flex flex-col gap-5">
//           {error && (
//             <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg text-center font-medium">
//               {error}
//             </div>
//           )}

//           {/* 2. Custom Selector Tabs */}
//           <div className="flex w-full border-b border-slate-200 text-center font-medium">
//             <button
//               onClick={() => { setActiveTab("phone"); setStep("phone"); }}
//               className={`w-1/2 pb-2 text-base transition-colors ${activeTab === "phone" ? "border-b-2 border-slate-900 text-slate-900 font-bold" : "text-slate-400"}`}
//             >
//               Phone
//             </button>
//             <button
//               onClick={() => setActiveTab("gmail")}
//               className={`w-1/2 pb-2 text-base transition-colors ${activeTab === "gmail" ? "border-b-2 border-slate-900 text-slate-900 font-bold" : "text-slate-400"}`}
//             >
//               Gmail login
//             </button>
//           </div>

//           {/* 3. Promo Subtext (always visible below tabs) */}
//           <div className="text-center text-sm font-semibold text-amber-600 tracking-wide bg-amber-50/60 py-1.5 rounded-md">
//             ✨ Log in to get rewards and order
//           </div>

//           {/* 4. Main Tab Interface Content Boxes */}
//           {activeTab === "phone" ? (
//             <div className="w-full">
//               {step === "phone" ? (
//                 <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
//                   <div className="relative">
//                     <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-semibold">+91</span>
//                     <Input
//                       type="tel"
//                       placeholder="Enter 10 digit number"
//                       value={phone}
//                       onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
//                       className="pl-12 text-base h-11"
//                       disabled={loading}
//                     />
//                   </div>
//                   <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
//                     {loading ? "Sending..." : "Send OTP"}
//                   </Button>
//                 </form>
//               ) : (
//                 <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
//                   <div className="flex flex-col gap-2 text-center">
//                     <span className="text-xs text-slate-400">Verifying +91 {phone}</span>
//                     <div className="flex justify-between gap-2 max-w-xs mx-auto w-full">
//                       {otp.map((digit, index) => (
//                         <Input
//                           key={index}
//                           id={`otp-${index}`}
//                           type="text"
//                           pattern="[0-9]*"
//                           inputMode="numeric"
//                           maxLength={1}
//                           value={digit}
//                           onChange={(e) => handleOtpChange(e.target.value, index)}
//                           className="w-10 h-12 text-center text-lg font-bold p-0 border-slate-300"
//                           disabled={loading}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
//                       {loading ? "Verifying..." : "Verify OTP"}
//                     </Button>
//                     <Button type="button" variant="ghost" size="sm" onClick={() => setStep("phone")} disabled={loading} className="text-slate-400">
//                       Back to Change Number
//                     </Button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           ) : (
//             <div className="w-full py-2">
//               <Button 
//                 variant="outline" 
//                 className="w-full h-11 text-base flex items-center justify-center gap-2 border-slate-300 hover:bg-slate-50"
//                 onClick={handleGoogleLogin}
//                 disabled={loading}
//               >
//                 🌐 Log in with Google
//               </Button>
//             </div>
//           )}

//           {/* 5. Horizontal Divider Section */}
//           <div className="relative flex py-2 items-center text-xs text-slate-300 uppercase font-semibold">
//             <div className="flex-grow border-t border-slate-200"></div>
//             <span className="flex-shrink mx-3 text-slate-400">Or Continue As</span>
//             <div className="flex-grow border-t border-slate-200"></div>
//           </div>

//           {/* 6. Guest Option (Always locked at bottom) */}
//           <div className="w-full">
//             <Button 
//               variant="secondary"
//               onClick={handleGuestLogin} 
//               className="w-full h-11 text-base font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border-0" 
//               disabled={loading}
//             >
//               Guest / no login needed
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
