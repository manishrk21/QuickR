import { notFound } from "next/navigation";
import { adminSupabase } from "@/lib/supabase/admin";

export default async function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const { data: restaurant } = await adminSupabase
    .from("restaurants")
    .select("id, name, slug, logo_url, primary_color, is_active")
    .eq("slug", params.slug)
    .single();

  if (!restaurant || !restaurant.is_active) notFound();

  return (
    <div
      style={
        {
          "--brand": restaurant.primary_color ?? "#16a34a",
          "--brand-light": restaurant.primary_color + "18",
        } as React.CSSProperties
      }
    >
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
          {/* {restaurant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "var(--brand)" }}
            >
              {restaurant.name[0]}
            </div>
           )}  */}

          <span className="inline-flex items-center gap-2 font-semibold text-slate-900 text-xl tracking-wide">
            {/* {restaurant.name} */}
            QuickR
            <svg 
              className="w-[1.1em] h-[1.1em] fill-current shrink-0" 
              viewBox="0 0 16 16" 
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M2 2h2v2H2z"/>
              <path d="M6 0v6H0V0zM5 1H1v4h4zM4 12H2v2h2z"/>
              <path d="M6 10v6H0v-6zm-5 1v4h4v-4zm11-9h2v2h-2z"/>
              <path d="M10 0v6h6V0zm5 1v4h-4V1zM8 1V0h1v2H8v2H7V1zm0 5V4h1v2zM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8zm0 0v1H2V8H1v1H0V7h3v1zm10 1h-1V7h1zm-1 0h-1v2h2v-1h-1zm-4 0h2v1h-1v1h-1zm2 3v-1h-1v1h-1v1H9v1h3v-2zm0 0h3v1h-2v1h-1zm-4-1v1h1v-2H7v1z"/>
              <path d="M7 12h1v3h4v1H7zm9 2v2h-3v-1h2v-1z"/>
            </svg> Menu
          </span>

          

        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-32">{children}</main>
    </div>
  );
}
