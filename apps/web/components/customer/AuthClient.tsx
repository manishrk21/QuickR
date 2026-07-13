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

  // 1. Phone login flow
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionRes = await fetch("/api/customer/mobile-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId, table_id: tableId, mobile: phone }),
      });

      if (!sessionRes.ok) {
        const data = await sessionRes.json();
        throw new Error(data.error || "Failed to create session.");
      }

      window.location.href = `/r/${slug}`;
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
      const sessionRes = await fetch("/api/customer/mobile-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId, table_id: tableId, mobile: phone }),
      });

      if (!sessionRes.ok) {
        const data = await sessionRes.json();
        throw new Error(data.error || "Failed to initialize session.");
      }

      window.location.href = `/r/${slug}`;
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
      localStorage.setItem("qr_pending_restaurant", restaurantId);
      if (tableId) {
        localStorage.setItem("qr_pending_table", tableId);
      } else {
        localStorage.removeItem("qr_pending_table");
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/r/${slug}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
      setLoading(false);
    }
  }

  // 4. Guest Flow
  async function handleGuestLogin() {
    setLoading(true);
    setError(null);

    const cookies = document.cookie.split(';');
    const tableCookie = cookies.find(c => c.trim().startsWith('qr_table='));
    const extractedTableId = tableCookie ? tableCookie.split('=')[1] : tableId;

    try {
      const res = await fetch("/api/customer/guest-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          restaurant_id: restaurantId, 
          table_id: extractedTableId 
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#FAF9F5] font-sans selection:bg-[#630102] selection:text-white relative overflow-hidden">
      {/* Premium background ambient blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] rounded-full bg-[#630102] opacity-5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] rounded-full bg-[#400102] opacity-5 blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md p-3 sm:p-5 shadow-[0_24px_60px_rgba(28,0,1,0.04)] bg-white border border-slate-200/60 rounded-2xl relative z-10 transition-all duration-300 hover:shadow-[0_24px_60px_rgba(28,0,1,0.07)]">
        
        {/* 1. Welcome Header */}
        <CardHeader className="text-center pb-4 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#630102] mb-1">Welcome Guest</p>
          <CardTitle className="text-2xl sm:text-3xl font-normal tracking-tight text-slate-940 font-serif leading-tight">
            {restaurantName}
          </CardTitle>
          <div className="h-0.5 w-8 bg-gradient-to-r from-[#630102]/40 to-transparent mx-auto mt-3 rounded-full" />
        </CardHeader>
        
        <CardContent className="flex flex-col gap-6">
          {error && (
            <div className="p-3.5 text-xs font-medium text-red-800 bg-red-50/60 border border-red-100/70 rounded-xl text-center tracking-wide animate-in fade-in duration-200">
              ✦ {error}
            </div>
          )}

          {/* 2. Custom Selector Tabs */}
          <div className="flex w-full border-b border-slate-100 text-center font-medium">
            <button
              onClick={() => { setActiveTab("phone"); setStep("phone"); }}
              className={`w-1/2 pb-3 text-sm tracking-wide transition-all relative ${
                activeTab === "phone" 
                  ? "text-[#630102] font-semibold" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Mobile Access
              {activeTab === "phone" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#630102] animate-in slide-in-from-left-4 duration-200" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("gmail")}
              className={`w-1/2 pb-3 text-sm tracking-wide transition-all relative ${
                activeTab === "gmail" 
                  ? "text-[#630102] font-semibold" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Google Account
              {activeTab === "gmail" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#630102] animate-in slide-in-from-right-4 duration-200" />
              )}
            </button>
          </div>

          {/* 3. Promo Subtext */}
          <div className="text-center text-[11px] font-medium text-[#630102] tracking-wider uppercase bg-[#630102]/5 py-2 px-3 rounded-xl border border-[#630102]/10 backdrop-blur-sm">
            ✨ Unlock Exclusive Dining Rewards
          </div>

          {/* 4. Main Tab Interface Content Boxes */}
          {activeTab === "phone" ? (
            <div className="w-full animate-in fade-in-50 duration-200">
              {step === "phone" ? (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <div className="relative group">
                    <span className="absolute left-4 top-[13px] text-slate-400 text-sm font-medium tracking-wide border-r border-slate-200 pr-2.5">
                      +91
                    </span>
                    <Input
                      type="tel"
                      placeholder="Enter mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="pl-16 text-sm h-12 border-slate-200 bg-slate-50/40 focus:bg-white transition-all focus:ring-4 focus:ring-[#630102]/5 focus:border-[#630102] rounded-xl tracking-wide font-normal placeholder:text-slate-400"
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-sm font-medium bg-[#630102] hover:bg-[#400102] text-white rounded-xl shadow-sm tracking-wide transition-all duration-200 active:scale-[0.99] border border-[#1C0001]/20" 
                    disabled={loading}
                  >
                    {loading ? "Requesting Entry..." : "Send Verification OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 text-center">
                    <span className="text-xs text-slate-400 tracking-wide">
                      Verifying secure line to <strong className="text-slate-700 font-medium">+91 {phone}</strong>
                    </span>
                    <div className="flex justify-between gap-2 max-w-xs mx-auto w-full py-1">
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
                          className="w-10 h-12 text-center text-lg font-serif font-bold p-0 border-slate-200 bg-slate-50/30 focus:bg-white transition-all focus:ring-4 focus:ring-[#630102]/5 focus:border-[#630102] rounded-xl shadow-inner"
                          disabled={loading}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-sm font-medium bg-[#630102] hover:bg-[#400102] text-white rounded-xl shadow-sm tracking-wide transition-all duration-200 active:scale-[0.99]" 
                      disabled={loading}
                    >
                      {loading ? "Authorizing..." : "Verify & Enter"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setStep("phone")} 
                      disabled={loading} 
                      className="text-xs text-slate-400 hover:text-slate-600 hover:bg-transparent font-normal tracking-wide underline underline-offset-4"
                    >
                      Change Phone Number
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="w-full py-1 animate-in fade-in-50 duration-200">
              <Button 
                variant="outline" 
                className="w-full h-12 text-sm font-medium flex items-center justify-center gap-2.5 border-slate-200 bg-slate-50/30 text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:border-slate-300 shadow-sm"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
            </div>
          )}

          {/* 5. Horizontal Divider Section */}
          <div className="relative flex py-1 items-center text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-3 text-slate-400/80 font-mono">Or Express Access</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* 6. Guest Option */}
          <div className="w-full">
            <Button 
              variant="secondary"
              onClick={handleGuestLogin} 
              className="w-full h-12 text-sm font-medium bg-slate-100/70 hover:bg-slate-200/80 text-slate-600 rounded-xl transition-all duration-200 border-0 tracking-wide active:scale-[0.99]" 
              disabled={loading}
            >
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





// "use client";

// import React, { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { createClient } from "@/lib/supabase/client";

// interface AuthClientProps {
//   restaurantId: string;
//   restaurantName: string;
//   slug: string;
//   tableId: string | null;
// }

// export default function AuthClient({ restaurantId, restaurantName, slug, tableId }: AuthClientProps) {
//   const supabase = createClient();
//   const [activeTab, setActiveTab] = useState<"phone" | "gmail">("phone");
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [step, setStep] = useState<"phone" | "otp">("phone");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // 1. Phone login flow
//   async function handleSendOtp(e: React.FormEvent) {
//     e.preventDefault();
//     if (phone.length < 10) {
//       setError("Please enter a valid 10-digit mobile number.");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       // OTP verification stays here for later re-enable, but phone login currently bypasses OTP.
//       // const otpRes = await fetch("http://localhost:4000/otp/send", {
//       //   method: "POST",
//       //   headers: { "Content-Type": "application/json" },
//       //   body: JSON.stringify({ phone }),
//       // });
//       // const otpData = await otpRes.json();
//       // if (!otpRes.ok) throw new Error(otpData.error || "Failed to send OTP.");

//       const sessionRes = await fetch("/api/customer/mobile-session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ restaurant_id: restaurantId, table_id: tableId, mobile: phone }),
//       });

//       if (!sessionRes.ok) {
//         const data = await sessionRes.json();
//         throw new Error(data.error || "Failed to create session.");
//       }

//       window.location.href = `/r/${slug}`;
//     } catch (err: any) {
//       setError(err.message || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // 2. Verify OTP Flow
//   async function handleVerifyOtp(e: React.FormEvent) {
//     e.preventDefault();
//     const fullOtp = otp.join("");
//     if (fullOtp.length < 6) {
//       setError("Please enter the complete 6-digit OTP.");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       // OTP verification stays available for later re-enable.
//       // const res = await fetch("http://localhost:4000/otp/verify", {
//       //   method: "POST",
//       //   headers: { "Content-Type": "application/json" },
//       //   body: JSON.stringify({ phone, otp: fullOtp }),
//       // });
//       // const data = await res.json();
//       // if (!res.ok) throw new Error(data.error || "Invalid OTP.");

//       const sessionRes = await fetch("/api/customer/mobile-session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ restaurant_id: restaurantId, table_id: tableId, mobile: phone }),
//       });

//       if (!sessionRes.ok) {
//         const data = await sessionRes.json();
//         throw new Error(data.error || "Failed to initialize session.");
//       }

//       window.location.href = `/r/${slug}`;
//     } catch (err: any) {
//       setError(err.message || "Verification failed.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // 3. Google OAuth Flow
//   async function handleGoogleLogin() {
//     setLoading(true);
//     setError(null);
//     try {
//       localStorage.setItem("qr_pending_restaurant", restaurantId);
//       if (tableId) {
//         localStorage.setItem("qr_pending_table", tableId);
//       } else {
//         localStorage.removeItem("qr_pending_table");
//       }

//       const { error } = await supabase.auth.signInWithOAuth({
//         provider: "google",
//         options: {
//           redirectTo: `${window.location.origin}/r/${slug}/auth/callback`,
//         },
//       });
//       if (error) throw error;
//     } catch (err: any) {
//       setError(err.message || "Google sign-in failed.");
//       setLoading(false);
//     }
//   }

//   // 4. Guest Flow
//   // async function handleGuestLogin() {
//   //   setLoading(true);
//   //   setError(null);

//   //   try {
//   //     const res = await fetch("/api/customer/guest-session", {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ restaurant_id: restaurantId, table_id: tableId }),
//   //     });

//   //     if (res.ok) {
//   //       window.location.href = `/r/${slug}`;
//   //     } else {
//   //       throw new Error("Failed to join as guest.");
//   //     }
//   //   } catch (err: any) {
//   //     setError(err.message || "Something went wrong.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }
//   // apps/web/components/customer/AuthClient.tsx

// async function handleGuestLogin() {
//   setLoading(true);
//   setError(null);

//   // 1. Explicitly get the table ID from the browser's cookies
//   const cookies = document.cookie.split(';');
//   const tableCookie = cookies.find(c => c.trim().startsWith('qr_table='));
//   const extractedTableId = tableCookie ? tableCookie.split('=')[1] : tableId;

//   try {
//     const res = await fetch("/api/customer/guest-session", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ 
//         restaurant_id: restaurantId, 
//         table_id: extractedTableId // Send the extracted ID explicitly
//       }),
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


//   const handleOtpChange = (value: string, index: number) => {
//     if (isNaN(Number(value))) return;
//     const newOtp = [...otp];
//     newOtp[index] = value.substring(value.length - 1);
//     setOtp(newOtp);

//     if (value && index < 5) {
//       const nextInput = document.getElementById(`otp-${index + 1}`);
//       nextInput?.focus();
//     }
//   };

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
