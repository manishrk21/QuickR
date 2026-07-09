"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  QrCode,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  BarChart2, FolderOpen } from "lucide-react";

interface SidebarProps {
  slug: string;
  restaurantName: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = (slug: string) => [
    { href: `/admin/${slug}`,                    icon: LayoutDashboard, label: "Dashboard" },
    { href: `/admin/${slug}/orders`,             icon: ClipboardList,   label: "Orders" },
    { href: `/admin/${slug}/counter`,            icon: ShoppingBag,     label: "Counter" },   // ← Added Row
    { href: `/admin/${slug}/menu`,               icon: UtensilsCrossed, label: "Menu" },
    { href: `/admin/${slug}/menu/categories`,    icon: FolderOpen,      label: "Categories" },
    { href: `/admin/${slug}/tables`,             icon: QrCode,          label: "Tables & QR" },
    { href: `/admin/${slug}/customers`,          icon: Users,           label: "Customers" },
    { href: `/admin/${slug}/analytics`,          icon: BarChart2,       label: "Analytics" },
    { href: `/admin/${slug}/settings`,           icon: Settings,        label: "Settings" },
  ];

export function Sidebar({ slug, restaurantName, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    // Sidebar: fixed on small screens, slides in/out; static on lg+
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-60 transform bg-[#630102] text-white shadow-lg transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:fixed lg:shadow-none`}
    >
      {/* Mobile close button */}
      <div className="flex items-center justify-end px-3 py-2 lg:hidden">
        <button
          onClick={() => onClose?.()}
          aria-label="Close menu"
          className="rounded-md p-1 text-white hover:bg-white/10"
        >
          ✕
        </button>
      </div>
      {/* Brand */}
      <div className="border-b border-white/10 px-5 py-5">
        <span className="text-lg font-bold text-white tracking-tight">
          Quick<span className="text-[#ccc7b3ed]">R</span> Dine
          
            
        </span>
        <p className="text-xs text-[#ccc7b3ed] mt-0.5 truncate">{restaurantName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems(slug).map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                ${active
                  ? "bg-white/10 text-white font-medium"
                  : "text-[#ccc7b3ed] hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Icon
                size={16}
                className={active ? "text-white" : ""}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm
                     text-[#ccc7b3ed] hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}



// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { createClient } from "@/lib/supabase/client";
// import { useRouter } from "next/navigation";
// import { LayoutDashboard,
//   UtensilsCrossed,
//   QrCode,
//   ClipboardList,
//   Users,
//   Settings,
//   LogOut,
//   BarChart2, FolderOpen } from "lucide-react";

// interface SidebarProps {
//   slug: string;
//   restaurantName: string;
//   isOpen?: boolean;
//   onClose?: () => void;
// }

// const navItems = (slug: string) => [
//     { href: `/admin/${slug}`,                    icon: LayoutDashboard, label: "Dashboard" },
//     { href: `/admin/${slug}/orders`,             icon: ClipboardList,   label: "Orders" },
//     { href: `/admin/${slug}/menu`,               icon: UtensilsCrossed, label: "Menu" },
//     { href: `/admin/${slug}/menu/categories`,    icon: FolderOpen,      label: "Categories" },
//     { href: `/admin/${slug}/tables`,             icon: QrCode,          label: "Tables & QR" },
//     { href: `/admin/${slug}/customers`,          icon: Users,           label: "Customers" },
//     { href: `/admin/${slug}/analytics`,          icon: BarChart2,       label: "Analytics" },
//     { href: `/admin/${slug}/settings`,           icon: Settings,        label: "Settings" },
//   ];

// export function Sidebar({ slug, restaurantName, isOpen, onClose }: SidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const supabase = createClient();

//   async function handleLogout() {
//     await supabase.auth.signOut();
//     router.push("/admin/login");
//   }

//   return (
//     // Sidebar: fixed on small screens, slides in/out; static on lg+
//     <aside
//       className={`fixed inset-y-0 left-0 w-60 transform transition-transform duration-300 z-50 bg-[#630102] text-white shadow-lg ${
//         isOpen ? "translate-x-0" : "-translate-x-full"
//       } lg:translate-x-0 lg:fixed lg:shadow-none`}
//     >
//       {/* Mobile close button */}
//       <div className="flex items-center justify-end px-3 py-2 lg:hidden">
//         <button
//           onClick={() => onClose?.()}
//           aria-label="Close menu"
//           className="rounded-md p-1 text-white hover:bg-white/10"
//         >
//           ✕
//         </button>
//       </div>
//       {/* Brand */}
//       <div className="px-5 py-5 border-b border-white/10">
//         <span className="text-lg font-bold text-white tracking-tight">
//           Quick<span className="text-[#ccc7b3ed]">R</span> Dine
          
            
//         </span>
//         <p className="text-xs text-[#ccc7b3ed] mt-0.5 truncate">{restaurantName}</p>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
//         {navItems(slug).map(({ href, icon: Icon, label }) => {
//           const active = pathname === href || pathname.startsWith(href + "/");
//           return (
//             <Link
//               key={href}
//               href={href}
//               className={`
//                 flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
//                 ${active
//                   ? "bg-white/10 text-white font-medium"
//                   : "text-[#ccc7b3ed] hover:text-white hover:bg-white/5"
//                 }
//               `}
//             >
//               <Icon
//                 size={16}
//                 className={active ? "text-white" : ""}
//               />
//               {label}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="px-3 py-4 border-t border-white/10">
//         <button
//           onClick={handleLogout}
//           className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm
//                      text-[#ccc7b3ed] hover:text-white hover:bg-white/5 transition-colors"
//         >
//           <LogOut size={16} />
//           Sign out
//         </button>
//       </div>
//     </aside>
//   );
// }
