

"use client";
import { useState } from "react";import { useRouter } from "next/navigation";import { Button } from "@/components/ui/button";import { Input } from "@/components/ui/input";import { Label } from "@/components/ui/label";import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";import { Store, Palette, Award, Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";
interface Restaurant {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  loyalty_streak_target: number;
  primary_color: string;
}
export function SettingsForm({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: restaurant.name,
    address: restaurant.address ?? "",
    phone: restaurant.phone ?? "",
    loyalty_streak_target: restaurant.loyalty_streak_target,
    primary_color: restaurant.primary_color,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
    setSuccess(false);
    setError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/restaurants/${restaurant.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to finalize operations.");
      }

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected transmission error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl mx-auto pb-12">
      {/* Block 1: Core Restaurant Metadata Identity */}
      <Card className="border-[#630102]/10 bg-[#EDEBDE] shadow-[0_4px_20px_rgba(99,1,2,0.02)] rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_4px_20px_rgba(99,1,2,0.04)]">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b border-[#630102]/10 pb-4">
          <div className="p-2 bg-[#630102]/5 rounded-lg text-[#630102]">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-[#0d0000]">Restaurant Profile</CardTitle>
            <CardDescription className="text-xs text-[#0d0000]/60">Update your public marketplace identity details.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[#0d0000]/70">
                Official Business Name
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. The Grand Bistro"
                className="h-11 border-[#630102]/15 bg-white/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/10 focus:border-[#630102] rounded-lg text-sm text-[#0d0000]"
                required
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-[#0d0000]/70">
                Contact Phone Line
              </Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="h-11 border-[#630102]/15 bg-white/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/10 focus:border-[#630102] rounded-lg text-sm font-mono text-[#0d0000]"
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-[#0d0000]/70">
                Physical Operations Address
              </Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Complete street block details, city, postal code"
                className="h-11 border-[#630102]/15 bg-white/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/10 focus:border-[#630102] rounded-lg text-sm text-[#0d0000]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block 2: Brand Styling Interfaces */}
      <Card className="border-[#630102]/10 bg-[#EDEBDE] shadow-[0_4px_20px_rgba(99,1,2,0.02)] rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_4px_20px_rgba(99,1,2,0.04)]">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b border-[#630102]/10 pb-4">
          <div className="p-2 bg-[#630102]/5 rounded-lg text-[#630102]">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-[#0d0000]">Brand Presentation</CardTitle>
            <CardDescription className="text-xs text-[#0d0000]/60">Customize interface styling parameters across digital menus.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2.5 max-w-md">
            <Label htmlFor="color" className="text-xs font-semibold uppercase tracking-wider text-[#0d0000]/70">
              Primary UI Accent Tone
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-14 shrink-0 rounded-lg border border-[#630102]/20 overflow-hidden shadow-inner bg-white/40 flex items-center justify-center">
                <input
                  id="color"
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => set("primary_color", e.target.value)}
                  className="absolute inset-0 h-full w-full scale-150 cursor-pointer border-0 p-0"
                />
              </div>
              <Input
                value={form.primary_color}
                onChange={(e) => set("primary_color", e.target.value)}
                className="h-11 font-mono tracking-wider text-sm border-[#630102]/15 bg-white/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/10 focus:border-[#630102] rounded-lg uppercase w-36"
                maxLength={7}
              />
            </div>
            <p className="text-[11px] text-[#630102]/65 leading-normal">
              Applies system-wide highlights on active states, digital buttons, and digital customer carts.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Block 3: Retention Operations Engine */}
      <Card className="border-[#630102]/10 bg-[#EDEBDE] shadow-[0_4px_20px_rgba(99,1,2,0.02)] rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_4px_20px_rgba(99,1,2,0.04)]">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b border-[#630102]/10 pb-4">
          <div className="p-2 bg-[#630102]/5 rounded-lg text-[#630102]">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-[#0d0000]">Gamified Loyalty Matrix</CardTitle>
            <CardDescription className="text-xs text-[#0d0000]/60">Configure programmatic parameters for recurring footfall rewards.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2.5 max-w-sm">
            <Label htmlFor="streak" className="text-xs font-semibold uppercase tracking-wider text-[#0d0000]/70">
              Check-In Verification Targets
            </Label>
            <div className="relative flex items-center">
              <Input
                id="streak"
                type="number"
                min={2}
                max={30}
                value={form.loyalty_streak_target}
                onChange={(e) => set("loyalty_streak_target", Number(e.target.value))}
                className="h-11 border-[#630102]/15 bg-white/50 focus:bg-white transition-all focus:ring-2 focus:ring-[#630102]/10 focus:border-[#630102] rounded-lg text-sm text-[#0d0000]"
              />
              <span className="absolute right-4 text-xs font-medium text-[#0d0000]/40 pointer-events-none">
                visits
              </span>
            </div>
            <p className="text-[11px] text-[#630102]/65 leading-normal">
              Determines how many physical menu check-ins a verified data principal must cross before triggering automatic reward allocation states.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Feedback Messaging Subsystems */}
      <div className="space-y-3">
        {error && (
          <div className="flex gap-2.5 items-start text-xs font-medium text-red-800 bg-red-50 border border-red-200/60 p-3.5 rounded-lg shadow-sm animate-in fade-in-50 duration-200">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <p className="leading-normal">{error}</p>
          </div>
        )}
        {/* n */}

        {success && (
          <div className="flex gap-2.5 items-start text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 p-3.5 rounded-lg shadow-sm animate-in fade-in-50 duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-normal">Configuration engine successfully saved and pushed live.</p>
          </div>
        )}
      </div>

      {/* Core Operational CTA Button */}
      <div className="flex justify-end pt-2 border-t border-[#630102]/10">
        <Button 
          type="submit" 
          className="h-11 px-6 bg-[#630102] hover:bg-[#400102] text-white font-medium shadow-sm transition-all duration-150 rounded-lg flex items-center gap-2 active:scale-[0.98]" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving adjustments...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 opacity-80" />
              <span>Save Configuration</span>
            </>
          )}
        </Button>
      </div>

    </form>
  );
}

      








// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// interface Restaurant {
//   id: string;
//   slug: string;
//   name: string;
//   address: string | null;
//   phone: string | null;
//   loyalty_streak_target: number;
//   primary_color: string;
// }

// export function SettingsForm({ restaurant }: { restaurant: Restaurant }) {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     name: restaurant.name,
//     address: restaurant.address ?? "",
//     phone: restaurant.phone ?? "",
//     loyalty_streak_target: restaurant.loyalty_streak_target,
//     primary_color: restaurant.primary_color,
//   });
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState("");

//   function set(field: string, value: string | number) {
//     setForm((f) => ({ ...f, [field]: value }));
//     setSuccess(false);
//   }

//   async function handleSave(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const res = await fetch(`/api/admin/restaurants/${restaurant.slug}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });

//     if (!res.ok) {
//       const data = await res.json();
//       setError(data.error ?? "Failed to save.");
//     } else {
//       setSuccess(true);
//       router.refresh();
//     }
//     setLoading(false);
//   }

//   return (
//     <form onSubmit={handleSave} className="space-y-6">
//       <Card className="border-[#630102]/10 bg-[#EDEBDE] shadow-sm">
//         <CardHeader>
//           <CardTitle className="text-base">Restaurant info</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-1.5">
//             <Label htmlFor="name">Restaurant name</Label>
//             <Input
//               id="name"
//               value={form.name}
//               onChange={(e) => set("name", e.target.value)}
//               required
//             />
//           </div>

//           <div className="space-y-1.5">
//             <Label htmlFor="address">Address</Label>
//             <Input
//               id="address"
//               value={form.address}
//               onChange={(e) => set("address", e.target.value)}
//             />
//           </div>

//           <div className="space-y-1.5">
//             <Label htmlFor="phone">Phone</Label>
//             <Input
//               id="phone"
//               value={form.phone}
//               onChange={(e) => set("phone", e.target.value)}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="border-[#630102]/10 bg-[#EDEBDE] shadow-sm">
//         <CardHeader>
//           <CardTitle className="text-base">Branding</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-1.5">
//             <Label htmlFor="color">Brand color</Label>
//             <div className="flex flex-col sm:flex-row sm:items-center gap-3">
//               <input
//                 id="color"
//                 type="color"
//                 value={form.primary_color}
//                 onChange={(e) => set("primary_color", e.target.value)}
//                 className="h-10 w-full sm:w-16 rounded border cursor-pointer"
//               />
//               <Input
//                 value={form.primary_color}
//                 onChange={(e) => set("primary_color", e.target.value)}
//                 className="font-mono w-full sm:w-32"
//                 maxLength={7}
//               />
//             </div>
//             <p className="text-xs text-[#630102]/45">
//               Shown on your menu page. Default is green.
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="border-[#630102]/10 bg-[#EDEBDE] shadow-sm">
//         <CardHeader>
//           <CardTitle className="text-base">Loyalty program</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-1.5">
//             <Label htmlFor="streak">
//               Visits required to earn reward
//             </Label>
//             <Input
//               id="streak"
//               type="number"
//               min={2}
//               max={30}
//               value={form.loyalty_streak_target}
//               onChange={(e) => set("loyalty_streak_target", Number(e.target.value))}
//             />
//             <p className="text-xs text-[#630102]/45">
//               Customers earn a reward after this many visits to your restaurant.
//             </p>
//           </div>
//         </CardContent>
//       </Card>

      

//       {error && (
//         <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
//           {error}
//         </p>
//       )}

//       {success && (
//         <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
//           Settings saved.
//         </p>
//       )}
  
//       <Button type="submit" disabled={loading}>
//         {loading ? "Saving…" : "Save changes"}
//       </Button>
//     </form>
//   );
// }


