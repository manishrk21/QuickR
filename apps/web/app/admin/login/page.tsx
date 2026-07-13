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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FAF9F5]">
      
      {/* Left Column: Premium Brand & Value Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#1C0001] to-[#400102] text-white relative overflow-hidden">
        {/* Background Visual Grid Anchor */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
        
        <div className="relative z-10 flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">
            Quick<span className="text-[#FFC7C7]">R</span>
          </span>
          <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
            HQ Engine
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white/90 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Secure Enterprise Authentication</span>
          </div>
          <h2 className="text-4xl font-semibold tracking-tight leading-tight">
            Manage your digital kitchen matrix with zero friction.
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Monitor real-time table telemetry, push instantaneous live menu updates, and track smart customer retention loops from an unified portal.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-white/40 border-top border-white/10 pt-6">
          <p>© {new Date().getFullYear()} QuickR Technologies Pvt Ltd.</p>
          <p>v2.4.0-production</p>
        </div>
      </div>

      {/* Right Column: Clean, Hyper-focused Login Engine */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm space-y-8">
          
          {/* Header Mobile Brand Trigger */}
          <div>
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold tracking-tight text-[#0d0000]">
                Quick<span className="text-[#630102]">R</span>
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your corporate credentials to access your terminal.
            </p>
          </div>

          {/* Core Interactive Login Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <form onSubmit={handleLogin} className="space-y-5">
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Business Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  autoComplete="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@restaurant.com"
                  className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/20 focus:border-[#630102] rounded-lg"
                  required 
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Secret Password
                  </Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  autoComplete="current-password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/20 focus:border-[#630102] rounded-lg"
                  required 
                />
              </div>

              {error && (
                <div className="flex gap-2.5 items-start text-xs font-medium text-red-700 bg-red-50/80 border border-red-100 px-3.5 py-3 rounded-lg animate-in fade-in-50 slide-in-from-top-1 duration-200">
                  <span className="mt-0.5 font-bold shrink-0">⚠️</span>
                  <p className="leading-normal">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-[#630102] hover:bg-[#400102] text-white font-medium shadow-sm transition-all duration-200 rounded-lg group flex items-center justify-center gap-1.5 active:scale-[0.99]" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white/80" />
                ) : (
                  <>
                    <span>Sign into Dashboard</span>
                    <ArrowRight className="h-4 w-4 text-white/70 group-hover:translate-x-0.5 transition-transform duration-150" />
                  </>
                )}
              </Button>
            </form>
            // Add at the bottom of the white card, below the form:
              <p className="mt-6 text-center text-xs text-slate-500">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="font-medium underline underline-offset-4"
                  style={{ color: "#630102" }}
                >
                  List your restaurant
                </a>
              </p>  
          </div>

          {/* Actionable Support Footer */}
          <div className="flex justify-center items-center gap-2 text-xs text-slate-400 pt-2">
            <HelpCircle className="h-3.5 w-3.5 text-slate-300" />
            <span>Need access parameters?</span>
            <a 
              href="mailto:mrk21@creates@gmail.com" 
              className="text-[#630102] font-medium hover:underline underline-offset-2"
            >
              Contact IT Support
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}









// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export default function AdminLoginPage() {
//   const router = useRouter();
//   const supabase = createClient();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleLogin(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const { data, error: authError } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (authError) {
//       setError("Invalid email or password.");
//       setLoading(false);
//       return;
//     }

//     // Get their restaurant slug + check must_change_password
//     const { data: member } = await supabase
//       .from("tenant_members")
//       .select("restaurant_id, must_change_password, restaurants(slug)")
//       .eq("user_id", data.user.id)
//       .single();

//     if (!member) {
//       setError("No restaurant linked to this account. Contact support.");
//       setLoading(false);
//       return;
//     }

//     const slug = (member.restaurants as any).slug;

//     if (member.must_change_password) {
//       router.push(`/admin/${slug}/change-password`);
//     } else {
//       router.push(`/admin/${slug}`);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--sidebar-bg))]">
//       <div className="w-full max-w-sm">
//         {/* Logo mark */}
//         <div className="mb-8 text-center">
//           <span className="text-2xl font-bold text-white tracking-tight">
//             Quick<span className="text-violet-400">R</span>
//           </span>
//           <p className="mt-1 text-sm text-slate-400">Restaurant admin</p>
//         </div>

//         <div className="bg-white rounded-xl p-8 shadow-2xl">
//           <h1 className="text-lg font-semibold text-slate-900 mb-6">Sign in</h1>

//           <form onSubmit={handleLogin} className="space-y-4">
//             <div className="space-y-1.5">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 autoComplete="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-1.5">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 autoComplete="current-password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>

//             {error && (
//               <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
//                 {error}
//               </p>
//             )}

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? "Signing in…" : "Sign in"}
//             </Button>
//           </form>
//         </div>

//         <p className="mt-6 text-center text-xs text-slate-500">
//           Need access?{" "}
//           <a href="mailto:mrk21@creates@gmail.com" className="text-violet-400 hover:underline">
//             Contact QuickR support
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }
