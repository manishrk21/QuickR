

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

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
      setError("The email or password you entered is incorrect.");
      setLoading(false);
      return;
    }

    const { data: member } = await supabase
      .from("tenant_members")
      .select("restaurant_id, must_change_password, restaurants(slug)")
      .eq("user_id", data.user.id)
      .single();
    
    // Check if superadmin
    const { data: superadminRow } = await supabase
      .from("superadmins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .single();
    
    if (superadminRow) {
      router.push("/superadmin");
      return;
    }
    
    if (!member) {
      setError("No restaurant enterprise profile linked. Please contact your administrator.");
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#1C0001] via-[#2E0001] to-[#400102]">
      {/* Main Glassmorphism Wrapper Card */}
      <div className="w-full max-w-md p-6 shadow-2xl bg-white/5 backdrop-blur-xl border border-[#630102]/40 rounded-2xl">
        
        {/* 1. Welcome Header */}
        <div className="text-center pb-4 pt-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">{restaurantName}</span>
          </h2>
        </div>
  
        <div className="flex flex-col gap-6">
          {error && (
            <div className="p-3 text-sm text-red-200 bg-red-950/50 border border-red-800/60 rounded-xl text-center font-medium backdrop-blur-sm">
              {error}
            </div>
          )}
  
          {/* 2. Custom Selector Tabs */}
          <div className="flex w-full p-1 bg-black/30 rounded-xl border border-[#630102]/20 text-center font-medium">
            <button 
              type="button"
              onClick={() => { setActiveTab("phone"); setStep("phone"); }} 
              className={`w-1/2 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                activeTab === "phone" 
                  ? "bg-gradient-to-r from-[#400102] to-[#630102] text-white shadow-md font-semibold border border-white/10" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Phone Number
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("gmail")} 
              className={`w-1/2 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                activeTab === "gmail" 
                  ? "bg-gradient-to-r from-[#400102] to-[#630102] text-white shadow-md font-semibold border border-white/10" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Google Account
            </button>
          </div>
  
          {/* 3. Promo Subtext */}
          <div className="text-center text-xs font-semibold text-amber-300 tracking-wide bg-amber-500/10 border border-amber-500/20 py-2 rounded-xl backdrop-blur-sm">
            ✨ Unlock exclusive rewards & fast checkout on login
          </div>
  
          {/* 4. Main Tab Interface Content Boxes */}
          {activeTab === "phone" ? (
            <div className="w-full">
              {step === "phone" ? (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <div className="relative group">
                    <span className="absolute left-4 top-3 text-slate-400 text-sm font-semibold border-r border-[#630102]/40 pr-2">
                      +91
                    </span>
                    <input 
                      type="tel" 
                      placeholder="Enter 10 digit number" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                      className="w-full pl-16 pr-4 text-base h-12 bg-black/40 border border-[#630102]/40 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200" 
                      disabled={loading} 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black shadow-lg rounded-xl transition-all duration-200 disabled:opacity-50" 
                    disabled={loading}
                  >
                    {loading ? "Sending security code..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 text-center">
                    <span className="text-sm text-slate-400">Verifying secure code sent to <b className="text-slate-200">+91 {phone}</b></span>
                    <div className="flex justify-between gap-2 max-w-xs mx-auto w-full">
                      {otp.map((digit, index) => (
                        <input 
                          key={index} 
                          id={`otp-${index}`} 
                          type="text" 
                          pattern="[0-9]*" 
                          inputMode="numeric" 
                          maxLength={1} 
                          value={digit} 
                          onChange={(e) => handleOtpChange(e.target.value, index)} 
                          className="w-12 h-12 text-center text-xl font-bold p-0 bg-black/40 border border-[#630102]/60 text-white rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" 
                          disabled={loading} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black shadow-lg rounded-xl transition-all duration-200 disabled:opacity-50" 
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setStep("phone")} 
                      disabled={loading} 
                      className="w-full text-center py-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 hover:bg-white/5 rounded-xl"
                    >
                      Back to Change Number
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="w-full py-1">
              <button 
                type="button"
                className="w-full h-12 text-base flex items-center justify-center gap-3 border border-[#630102]/60 bg-black/20 hover:bg-white/5 text-white rounded-xl transition-all duration-200 disabled:opacity-50" 
                onClick={handleGoogleLogin} 
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          )}
  
          {/* 5. Horizontal Divider Section */}
          <div className="relative flex py-1 items-center text-xs uppercase font-bold tracking-widest text-slate-500">
            <div className="flex-grow border-t border-[#630102]/30"></div>
            <span className="flex-shrink mx-4">Or</span>
            <div className="flex-grow border-t border-[#630102]/30"></div>
          </div>
  
          {/* 6. Guest Option */}
          <div className="w-full">
            <button 
              type="button"
              onClick={handleGuestLogin} 
              className="w-full h-12 text-base font-semibold bg-white/5 text-slate-300 hover:bg-white/10 border border-[#630102]/30 hover:border-[#630102]/60 rounded-xl transition-all duration-200 disabled:opacity-50" 
              disabled={loading}
            >
              Browse as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );

 
  

  // return (
  //   <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FAF9F5]">
      
  //     {/* Left Column: Premium Brand & Value Showcase (Hidden on Mobile) */}
  //     <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#1C0001] to-[#400102] text-white relative overflow-hidden">
  //       {/* Background Visual Grid Anchor */}
  //       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
        
  //       <div className="relative z-10 flex items-center gap-2">
  //         <span className="text-2xl font-bold tracking-tight">
  //           Quick<span className="text-[#FFC7C7]">R</span>
  //         </span>
  //         <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
  //           HQ Engine
  //         </span>
  //       </div>

  //       <div className="relative z-10 my-auto max-w-md space-y-6">
  //         <div className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white/90 backdrop-blur-sm">
  //           <ShieldCheck className="h-4 w-4 text-emerald-400" />
  //           <span>Secure Enterprise Authentication</span>
  //         </div>
  //         <h2 className="text-4xl font-semibold tracking-tight leading-tight">
  //           Manage your digital kitchen matrix with zero friction.
  //         </h2>
  //         <p className="text-white/60 text-base leading-relaxed">
  //           Monitor real-time table telemetry, push instantaneous live menu updates, and track smart customer retention loops from an unified portal.
  //         </p>
  //       </div>

  //       <div className="relative z-10 flex items-center justify-between text-xs text-white/40 border-top border-white/10 pt-6">
  //         <p>© {new Date().getFullYear()} QuickR Technologies Pvt Ltd.</p>
  //         <p>v2.4.0-production</p>
  //       </div>
  //     </div>

  //     {/* Right Column: Clean, Hyper-focused Login Engine */}
  //     <div className="flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-20 xl:px-24">
  //       <div className="mx-auto w-full max-w-sm space-y-8">
          
  //         {/* Header Mobile Brand Trigger */}
  //         <div>
  //           <div className="lg:hidden flex items-center gap-2 mb-6">
  //             <span className="text-2xl font-bold tracking-tight text-[#0d0000]">
  //               Quick<span className="text-[#630102]">R</span>
  //             </span>
  //           </div>
  //           <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
  //             Welcome back
  //           </h1>
  //           <p className="mt-2 text-sm text-slate-500">
  //             Enter your corporate credentials to access your terminal.
  //           </p>
  //         </div>

  //         {/* Core Interactive Login Matrix */}
  //         <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
  //           <form onSubmit={handleLogin} className="space-y-5">
              
  //             <div className="space-y-2">
  //               <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-slate-500">
  //                 Business Email
  //               </Label>
  //               <Input 
  //                 id="email" 
  //                 type="email" 
  //                 autoComplete="email" 
  //                 value={email} 
  //                 onChange={(e) => setEmail(e.target.value)} 
  //                 placeholder="name@restaurant.com"
  //                 className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/20 focus:border-[#630102] rounded-lg"
  //                 required 
  //               />
  //             </div>

  //             <div className="space-y-2">
  //               <div className="flex items-center justify-between">
  //                 <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-slate-500">
  //                   Secret Password
  //                 </Label>
  //               </div>
  //               <Input 
  //                 id="password" 
  //                 type="password" 
  //                 autoComplete="current-password" 
  //                 value={password} 
  //                 onChange={(e) => setPassword(e.target.value)} 
  //                 placeholder="••••••••"
  //                 className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/20 focus:border-[#630102] rounded-lg"
  //                 required 
  //               />
  //             </div>

  //             {error && (
  //               <div className="flex gap-2.5 items-start text-xs font-medium text-red-700 bg-red-50/80 border border-red-100 px-3.5 py-3 rounded-lg animate-in fade-in-50 slide-in-from-top-1 duration-200">
  //                 <span className="mt-0.5 font-bold shrink-0">⚠️</span>
  //                 <p className="leading-normal">{error}</p>
  //               </div>
  //             )}

  //             <Button 
  //               type="submit" 
  //               className="w-full h-11 bg-[#630102] hover:bg-[#400102] text-white font-medium shadow-sm transition-all duration-200 rounded-lg group flex items-center justify-center gap-1.5 active:scale-[0.99]" 
  //               disabled={loading}
  //             >
  //               {loading ? (
  //                 <Loader2 className="h-4 w-4 animate-spin text-white/80" />
  //               ) : (
  //                 <>
  //                   <span>Sign into Dashboard</span>
  //                   <ArrowRight className="h-4 w-4 text-white/70 group-hover:translate-x-0.5 transition-transform duration-150" />
  //                 </>
  //               )}
  //             </Button>
  //           </form>
  //             <p className="mt-6 text-center text-xs text-slate-500">
  //               Don't have an account?{" "}
  //               <a
  //                 href="/register"
  //                 className="font-medium underline underline-offset-4"
  //                 style={{ color: "#630102" }}
  //               >
  //                 List your restaurant
  //               </a>
  //             </p>  
  //         </div>

  //         {/* Actionable Support Footer */}
  //         <div className="flex justify-center items-center gap-2 text-xs text-slate-400 pt-2">
  //           <HelpCircle className="h-3.5 w-3.5 text-slate-300" />
  //           <span>Need access parameters?</span>
  //           <a 
  //             href="mailto:mrk21@creates@gmail.com" 
  //             className="text-[#630102] font-medium hover:underline underline-offset-2"
  //           >
  //             Contact IT Support
  //           </a>
  //         </div>

  //       </div>
  //     </div>

  //   </div>
  // );
}







