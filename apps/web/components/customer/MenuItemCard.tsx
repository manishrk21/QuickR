"use client";

import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/store/cart";

export function MenuItemCard({ item, primaryColor }: any) {
  const { addToCart, removeFromCart, cart } = useCartStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Find quantity for this specific item
  const cartItem = cart?.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;
  const isAvailable = item.is_available ?? true;
  
  // Custom non-veg/veg color styles
  const indicatorBorder = item.food_type === "veg" ? "border-green-600" : "border-red-600";
  const indicatorDot = item.food_type === "veg" ? "bg-green-600" : "bg-red-600";

  useEffect(() => {
    // Advanced observer configuration targets screen viewport center zone for popup effect
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsFocused(true);
          } else {
            setIsFocused(false);
          }
        });
      },
      {
        rootMargin: "-25% 0px -25% 0px", // Triggers when element crosses the center 50% section of screen
        threshold: 0.2
      }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  if (!isAvailable) return null;

  return (
    <div
      ref={cardRef}
      className={`flex items-center justify-between gap-4 rounded-xl border bg-white px-3.5 py-2 shadow-sm transition-all duration-300 ${
        isFocused 
          ? "border-slate-300 shadow-md translate-x-0.5 scale-[1.005]" 
          : "border-slate-100 shadow-sm"
      }`}
    >
      {/* 1. COMPACT IMAGE WRAPPER WITH INTEGRATED VIEWPORT POP-UP ZOOM */}
      <div 
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 transition-all duration-500 ease-out"
      >
        {item.signedImageUrl ? (
          <img
            src={item.signedImageUrl}
            alt={item.name}
            className={`h-full w-full object-cover transition-transform duration-500 ease-out ${
              isFocused ? "scale-115 brightness-105" : "scale-100"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[9px] font-medium text-slate-400">
            No Image
          </div>
        )}
      </div>

      {/* 2. SPECIFICATIONS BLOCK (Stretched to fit extra long item names cleanly) */}
      <div className="flex-[1.5] min-w-0 space-y-0.5">
        <div className="flex items-center gap-1.5">
          {/* Indian Food Veg/Non-Veg standard symbol indicator */}
          <div className={`flex h-3 w-3 items-center justify-center border-2 rounded-sm shrink-0 ${indicatorBorder}`}>
            <div className={`h-1 w-1 rounded-full ${indicatorDot}`} />
          </div>
          <h3 className="truncate text-sm font-semibold text-slate-900 tracking-tight">{item.name}</h3>
        </div>

        {/* Extra Information / Subtitle Description */}
        {item.description && (
          <p className="line-clamp-1 text-xs font-normal text-slate-500 leading-tight">
            {item.description}
          </p>
        )}
      </div>

      {/* 3. PRICE & QUANTITY CONTROLS COLUMN (Stacked configuration above action button) */}
      <div className="shrink-0 flex flex-col items-end justify-center gap-1.5 min-w-[84px]">
        {/* Price mapped above addition handler container */}
        <span className="text-sm font-bold text-slate-900 tabular-nums">₹{item.price}</span>

        {quantity > 0 ? (
          <div className="flex items-center justify-between w-full rounded-lg border border-slate-200 bg-slate-50 p-0.5 shadow-inner">
            <button
              onClick={() => removeFromCart(item.id)}
              className="flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-90"
            >
              -
            </button>
            <span className="text-xs font-bold text-slate-900 px-1 tabular-nums">{quantity}</span>
            <button
              onClick={() => addToCart(item)}
              className="flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-90"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(item)}
            className="w-full rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:brightness-105 active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}






// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useCartStore } from "@/store/cart";

// export function MenuItemCard({ item, primaryColor }: any) {
//   const { addToCart, removeFromCart, cart } = useCartStore();
//   const cardRef = useRef<HTMLDivElement>(null);
//   const [isVisible, setIsVisible] = useState(false);

//   // Find quantity for this specific item
//   const cartItem = cart?.find((i) => i.id === item.id);
//   const quantity = cartItem?.quantity || 0;
//   const isAvailable = item.is_available ?? true;
  
//   // Custom non-veg/veg color styles
//   const indicatorBorder = item.food_type === "veg" ? "border-green-600" : "border-red-600";
//   const indicatorDot = item.food_type === "veg" ? "bg-green-600" : "bg-red-600";

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//           observer.disconnect();
//         }
//       },
//       { threshold: 0.15 } // Trigger slightly earlier for responsive layouts
//     );
//     if (cardRef.current) observer.observe(cardRef.current);
//     return () => observer.disconnect();
//   }, []);

//   if (!isAvailable) return null;

//   return (
//     <div
//       ref={cardRef}
//       className="flex items-center justify-between gap-4 rounded-2xl border border-[#630102]/10 bg-[#EDEBDE] p-3.5 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
//     >
//       {/* 1. IMAGE CONTAINER WITH ANIMATION ZOOM ON SCROLL */}
//       <div 
//         className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#630102]/10 bg-[#630102]/[0.03] transition-all duration-700 ease-out ${
//           isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
//         }`}
//       >
//         {item.signedImageUrl ? (
//           <img
//             src={item.signedImageUrl}
//             alt={item.name}
//             className={`h-full w-full object-cover transition-transform duration-1000 ease-out ${
//               isVisible ? "scale-100" : "scale-125"
//             }`}
//           />
//         ) : (
//           <div className="flex h-full w-full items-center justify-center bg-stone-200 text-[10px] font-medium text-stone-400">
//             No Image
//           </div>
//         )}
//       </div>

//       {/* 2. SPECIFICATIONS BLOCK (Name, Veg Tag, Price, and Extra Info Description) */}
//       <div className="flex-1 min-w-0 space-y-1">
//         <div className="flex items-center gap-2">
//           {/* Authentic Indian-style Veg/Non-Veg square badge symbol */}
//           <div className={`flex h-3.5 w-3.5 items-center justify-center border-2 rounded-sm shrink-0 ${indicatorBorder}`}>
//             <div className={`h-1.5 w-1.5 rounded-full ${indicatorDot}`} />
//           </div>
//           <h3 className="truncate text-sm font-semibold text-[#1a0000]">{item.name}</h3>
//         </div>

//         {/* Price Display */}
//         <p className="text-sm font-bold text-[#1a0000]">₹{item.price}</p>

//         {/* Extra Information / Description */}
//         {item.description && (
//           <p className="line-clamp-2 text-xs font-normal leading-relaxed text-[#630102]/65">
//             {item.description}
//           </p>
//         )}
//       </div>

//       {/* 3. QUANTITY ACTIONS SECTOR */}
//       <div className="shrink-0 flex items-center justify-end pl-1 min-w-[76px]">
//         {quantity > 0 ? (
//           <div className="flex items-center justify-between w-full rounded-xl border border-[#630102]/20 bg-white p-1 shadow-sm">
//             <button
//               onClick={() => removeFromCart(item.id)}
//               className="flex h-6 w-6 items-center justify-center rounded-lg text-sm font-bold text-[#630102] transition hover:bg-[#630102]/5 active:scale-90"
//             >
//               -
//             </button>
//             <span className="text-xs font-semibold text-[#1a0000] px-1">{quantity}</span>
//             <button
//               onClick={() => addToCart(item)}
//               className="flex h-6 w-6 items-center justify-center rounded-lg text-sm font-bold text-[#630102] transition hover:bg-[#630102]/5 active:scale-90"
//             >
//               +
//             </button>
//           </div>
//         ) : (
//           <button
//             onClick={() => addToCart(item)}
//             className="w-full rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:brightness-105 active:scale-95"
//             style={{ backgroundColor: primaryColor }}
//           >
//             Add
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }


