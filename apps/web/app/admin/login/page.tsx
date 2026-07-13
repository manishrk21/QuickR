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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#FAF9F5] font-sans selection:bg-[#630102] selection:text-white">
      
      {/* Left Column: Premium Brand & Value Showcase (Spans 5 Columns) */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-16 bg-gradient-to-br from-[#1C0001] via-[#2D0001] to-[#400102] text-white relative overflow-hidden border-r border-[#630102]/20">
        {/* Deep Ambient Glow Background Elements */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#630102] opacity-25 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#400102] opacity-40 blur-[100px] pointer-events-none" />
        
        {/* Subtle Luxury Pattern Layer */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Brand Top Tier */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-2xl font-black tracking-tight uppercase font-serif">
            Quick<span className="text-[#FFC7C7]">R</span>
          </span>
          <span className="text-[9px] bg-white/10 text-[#FFC7C7] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-widest border border-white/5 backdrop-blur-md">
            HQ Engine v2.4
          </span>
        </div>

        {/* Narrative Core */}
        <div className="relative z-10 my-auto max-w-sm space-y-8">
          <div className="inline-flex h-8 items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-2 pr-4 text-xs text-white/90 backdrop-blur-md">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="tracking-wide font-medium text-white/80">Enterprise Grade Gateway</span>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-light tracking-tight leading-[1.15] font-serif text-slate-100">
              Control your <span className="font-normal text-white">digital culinary empire</span> with total precision.
            </h2>
            <div className="h-0.5 w-12 bg-gradient-to-r from-[#FFC7C7]/50 to-transparent rounded-full" />
          </div>

          <p className="text-white/70 text-sm leading-relaxed font-light tracking-wide">
            Access your secure cloud ecosystem. Synchronize high-fidelity table telemetry, deploy live operational directives, and monitor enterprise performance matrixes in real time.
          </p>
        </div>

        {/* Dynamic Footer Tier */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-white/40 font-mono tracking-wider uppercase border-t border-white/10 pt-6">
          <p>© QuickR Technologies</p>
          <p className="text-[#FFC7C7]/40">Secured Node</p>
        </div>
      </div>

      {/* Right Column: Royal SaaS Login Engine (Spans 7 Columns) */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-24 xl:px-32 relative bg-[radial-gradient(#63010204_1px,transparent_1px)] bg-[size:16px_16px]">
        <div className="mx-auto w-full max-w-[400px] space-y-10">
          
          {/* Mobile Header Visibility */}
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center items-center gap-2 mb-8">
              <span className="text-3xl font-black tracking-tight text-[#1C0001] font-serif">
                Quick<span className="text-[#630102]">R</span>
              </span>
              <span className="text-[9px] bg-[#630102]/10 text-[#630102] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-semibold">
                HQ Engine
              </span>
            </div>
            
            <h1 className="text-3xl font-normal tracking-tight text-slate-950 font-serif">
              Welcome to the Terminal
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-light tracking-wide">
              Please authenticate using your administrative corporate credentials.
            </p>
          </div>

          {/* Luxury Card Container */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-[0_20px_50px_rgba(64,1,2,0.03)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(64,1,2,0.06)] hover:border-slate-300/80">
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  Corporate Email Target
                </Label>
                <div className="relative group">
                  <Input 
                    id="email" 
                    type="email" 
                    autoComplete="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="identity@enterprise.com"
                    className="h-12 border-slate-200 bg-slate-50/40 text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all focus:ring-4 focus:ring-[#630102]/5 focus:border-[#630102] rounded-xl text-sm font-normal"
                    required 
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    Security Passkey
                  </Label>
                </div>
                <div className="relative group">
                  <Input 
                    id="password" 
                    type="password" 
                    autoComplete="current-password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••••••"
                    className="h-12 border-slate-200 bg-slate-50/40 text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all focus:ring-4 focus:ring-[#630102]/5 focus:border-[#630102] rounded-xl text-sm font-normal tracking-widest"
                    required 
                  />
                </div>
              </div>

              {/* Error Message Module */}
              {error && (
                <div className="flex gap-3 items-start text-xs font-medium text-red-800 bg-red-50/50 border border-red-100/80 p-4 rounded-xl animate-in fade-in-50 slide-in-from-top-2 duration-300">
                  <span className="text-sm shrink-0 leading-none">✦</span>
                  <p className="leading-relaxed tracking-wide">{error}</p>
                </div>
              )}

              {/* Submit Luxury Execution Trigger */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#630102] hover:bg-[#400102] text-white font-medium text-sm shadow-md transition-all duration-300 rounded-xl group flex items-center justify-center gap-2 active:scale-[0.985] relative overflow-hidden group border border-[#1C0001]/20" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white/90" />
                ) : (
                  <>
                    <span className="tracking-wide">Authorize Session</span>
                    <ArrowRight className="h-4 w-4 text-white/70 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </form>

            {/* Micro-Link Subtext */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-light tracking-wide">
                New instance setup?{" "}
                <a
                  href="/register"
                  className="font-semibold underline underline-offset-4 transition-colors hover:text-[#400102]"
                  style={{ color: "#630102" }}
                >
                  Register Enterprise Account
                </a>
              </p> 
            </div>
          </div>

          {/* Contextualized Identity Support */}
          <div className="flex justify-center items-center gap-2 text-xs text-slate-400 pt-2 font-light tracking-wide">
            <HelpCircle className="h-3.5 w-3.5 text-slate-300" />
            <span>Authentication issues?</span>
            <a 
              href="mailto:mrk21@creates@gmail.com" 
              className="text-[#630102] font-semibold hover:underline underline-offset-2 transition-colors duration-200"
            >
              Contact Node IT Team
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
// import { Loader2, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

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
//       setError("The email or password you entered is incorrect.");
//       setLoading(false);
//       return;
//     }

//     const { data: member } = await supabase
//       .from("tenant_members")
//       .select("restaurant_id, must_change_password, restaurants(slug)")
//       .eq("user_id", data.user.id)
//       .single();
    
//     // Check if superadmin
//     const { data: superadminRow } = await supabase
//       .from("superadmins")
//       .select("user_id")
//       .eq("user_id", data.user.id)
//       .single();
    
//     if (superadminRow) {
//       router.push("/superadmin");
//       return;
//     }
    
//     if (!member) {
//       setError("No restaurant enterprise profile linked. Please contact your administrator.");
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
//     <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FAF9F5]">
      
//       {/* Left Column: Premium Brand & Value Showcase (Hidden on Mobile) */}
//       <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#1C0001] to-[#400102] text-white relative overflow-hidden">
//         {/* Background Visual Grid Anchor */}
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
        
//         <div className="relative z-10 flex items-center gap-2">
//           <span className="text-2xl font-bold tracking-tight">
//             Quick<span className="text-[#FFC7C7]">R</span>
//           </span>
//           <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
//             HQ Engine
//           </span>
//         </div>

//         <div className="relative z-10 my-auto max-w-md space-y-6">
//           <div className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white/90 backdrop-blur-sm">
//             <ShieldCheck className="h-4 w-4 text-emerald-400" />
//             <span>Secure Enterprise Authentication</span>
//           </div>
//           <h2 className="text-4xl font-semibold tracking-tight leading-tight">
//             Manage your digital kitchen matrix with zero friction.
//           </h2>
//           <p className="text-white/60 text-base leading-relaxed">
//             Monitor real-time table telemetry, push instantaneous live menu updates, and track smart customer retention loops from an unified portal.
//           </p>
//         </div>

//         <div className="relative z-10 flex items-center justify-between text-xs text-white/40 border-top border-white/10 pt-6">
//           <p>© {new Date().getFullYear()} QuickR Technologies Pvt Ltd.</p>
//           <p>v2.4.0-production</p>
//         </div>
//       </div>

//       {/* Right Column: Clean, Hyper-focused Login Engine */}
//       <div className="flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-20 xl:px-24">
//         <div className="mx-auto w-full max-w-sm space-y-8">
          
//           {/* Header Mobile Brand Trigger */}
//           <div>
//             <div className="lg:hidden flex items-center gap-2 mb-6">
//               <span className="text-2xl font-bold tracking-tight text-[#0d0000]">
//                 Quick<span className="text-[#630102]">R</span>
//               </span>
//             </div>
//             <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
//               Welcome back
//             </h1>
//             <p className="mt-2 text-sm text-slate-500">
//               Enter your corporate credentials to access your terminal.
//             </p>
//           </div>

//           {/* Core Interactive Login Matrix */}
//           <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
//             <form onSubmit={handleLogin} className="space-y-5">
              
//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-slate-500">
//                   Business Email
//                 </Label>
//                 <Input 
//                   id="email" 
//                   type="email" 
//                   autoComplete="email" 
//                   value={email} 
//                   onChange={(e) => setEmail(e.target.value)} 
//                   placeholder="name@restaurant.com"
//                   className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/20 focus:border-[#630102] rounded-lg"
//                   required 
//                 />
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-slate-500">
//                     Secret Password
//                   </Label>
//                 </div>
//                 <Input 
//                   id="password" 
//                   type="password" 
//                   autoComplete="current-password" 
//                   value={password} 
//                   onChange={(e) => setPassword(e.target.value)} 
//                   placeholder="••••••••"
//                   className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/20 focus:border-[#630102] rounded-lg"
//                   required 
//                 />
//               </div>

//               {error && (
//                 <div className="flex gap-2.5 items-start text-xs font-medium text-red-700 bg-red-50/80 border border-red-100 px-3.5 py-3 rounded-lg animate-in fade-in-50 slide-in-from-top-1 duration-200">
//                   <span className="mt-0.5 font-bold shrink-0">⚠️</span>
//                   <p className="leading-normal">{error}</p>
//                 </div>
//               )}

//               <Button 
//                 type="submit" 
//                 className="w-full h-11 bg-[#630102] hover:bg-[#400102] text-white font-medium shadow-sm transition-all duration-200 rounded-lg group flex items-center justify-center gap-1.5 active:scale-[0.99]" 
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <Loader2 className="h-4 w-4 animate-spin text-white/80" />
//                 ) : (
//                   <>
//                     <span>Sign into Dashboard</span>
//                     <ArrowRight className="h-4 w-4 text-white/70 group-hover:translate-x-0.5 transition-transform duration-150" />
//                   </>
//                 )}
//               </Button>
//             </form>
//               <p className="mt-6 text-center text-xs text-slate-500">
//                 Don't have an account?{" "}
//                 <a
//                   href="/register"
//                   className="font-medium underline underline-offset-4"
//                   style={{ color: "#630102" }}
//                 >
//                   List your restaurant
//                 </a>
//               </p>  
//           </div>

//           {/* Actionable Support Footer */}
//           <div className="flex justify-center items-center gap-2 text-xs text-slate-400 pt-2">
//             <HelpCircle className="h-3.5 w-3.5 text-slate-300" />
//             <span>Need access parameters?</span>
//             <a 
//               href="mailto:mrk21@creates@gmail.com" 
//               className="text-[#630102] font-medium hover:underline underline-offset-2"
//             >
//               Contact IT Support
//             </a>
//           </div>

//         </div>
//       </div>

//     </div>
//   );
// }







