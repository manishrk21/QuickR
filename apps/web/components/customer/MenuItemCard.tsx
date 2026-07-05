"use client";

import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/store/cart";

export function MenuItemCard({ item, primaryColor }: any) {
  const { addToCart, removeFromCart, cart } = useCartStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Find quantity for this specific item
  const cartItem = cart?.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;
  const isAvailable = item.is_available ?? true;
  
  // Custom non-veg/veg color styles
  const indicatorBorder = item.food_type === "veg" ? "border-green-600" : "border-red-600";
  const indicatorDot = item.food_type === "veg" ? "bg-green-600" : "bg-red-600";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 } // Trigger slightly earlier for responsive layouts
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  if (!isAvailable) return null;

  return (
    <div
      ref={cardRef}
      className="flex items-center justify-between gap-4 rounded-2xl border border-[#630102]/10 bg-[#EDEBDE] p-3.5 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
    >
      {/* 1. IMAGE CONTAINER WITH ANIMATION ZOOM ON SCROLL */}
      <div 
        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#630102]/10 bg-[#630102]/[0.03] transition-all duration-700 ease-out ${
          isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {item.signedImageUrl ? (
          <img
            src={item.signedImageUrl}
            alt={item.name}
            className={`h-full w-full object-cover transition-transform duration-1000 ease-out ${
              isVisible ? "scale-100" : "scale-125"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-200 text-[10px] font-medium text-stone-400">
            No Image
          </div>
        )}
      </div>

      {/* 2. SPECIFICATIONS BLOCK (Name, Veg Tag, Price, and Extra Info Description) */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          {/* Authentic Indian-style Veg/Non-Veg square badge symbol */}
          <div className={`flex h-3.5 w-3.5 items-center justify-center border-2 rounded-sm shrink-0 ${indicatorBorder}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${indicatorDot}`} />
          </div>
          <h3 className="truncate text-sm font-semibold text-[#1a0000]">{item.name}</h3>
        </div>

        {/* Price Display */}
        <p className="text-sm font-bold text-[#1a0000]">₹{item.price}</p>

        {/* Extra Information / Description */}
        {item.description && (
          <p className="line-clamp-2 text-xs font-normal leading-relaxed text-[#630102]/65">
            {item.description}
          </p>
        )}
      </div>

      {/* 3. QUANTITY ACTIONS SECTOR */}
      <div className="shrink-0 flex items-center justify-end pl-1 min-w-[76px]">
        {quantity > 0 ? (
          <div className="flex items-center justify-between w-full rounded-xl border border-[#630102]/20 bg-white p-1 shadow-sm">
            <button
              onClick={() => removeFromCart(item.id)}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-sm font-bold text-[#630102] transition hover:bg-[#630102]/5 active:scale-90"
            >
              -
            </button>
            <span className="text-xs font-semibold text-[#1a0000] px-1">{quantity}</span>
            <button
              onClick={() => addToCart(item)}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-sm font-bold text-[#630102] transition hover:bg-[#630102]/5 active:scale-90"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(item)}
            className="w-full rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:brightness-105 active:scale-95"
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
//   const indicatorColor = (item.food_type === 'veg') ? 'bg-green-500' : 'bg-red-500';

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//           observer.disconnect();
//         }
//       },
//       { threshold: 0.25 }
//     );

//     if (cardRef.current) observer.observe(cardRef.current);

//     return () => observer.disconnect();
//   }, []);

//   if (!isAvailable) return null;

//   return (
//     <div
//       ref={cardRef}
//       className="grid grid-cols-[auto,1fr,auto] items-center gap-3 rounded-2xl border border-[#630102]/10 bg-[#EDEBDE] px-3 py-3 shadow-sm transition-all duration-500 sm:gap-4 sm:px-4"
//     >
//       {/* Image */}
//       <div className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#630102]/10 bg-[#630102]/[0.03] transition-all duration-500 ${isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}>
//         {item.signedImageUrl ? (
//           <img
//             src={item.signedImageUrl}
//             alt={item.name}
//             className={`h-full w-full object-cover transition-transform duration-700 ${isVisible ? "scale-100" : "scale-110"}`}
//           />
//         ) : (
//           <div className="flex h-full w-full items-center justify-center text-[8px] text-[#630102]/25">No Img</div>
//         )}
//       </div>

//       {/* Details */}
//       <div className="min-w-0 pr-1">
//         <h3 className="truncate font-semibold text-[#1a0000]">{item.name}</h3>
//         <p className="line-clamp-1 text-xs text-[#630102]/55">{item.description}</p>
//       </div>

//       {/* Indicator */}
//       <div className={`w-3 h-3 rounded-sm shrink-0 ${indicatorColor}`} />

//       {/* Price & Quantity Controls */}
//       <div className="flex shrink-0 flex-col items-end gap-1">
//         <span className="text-sm font-bold text-[#1a0000]">₹{item.price}</span>
        
//         {isAvailable ? (
//           quantity > 0 ? (
//             <div className="flex items-center gap-2 rounded-full border border-[#630102]/10 bg-[#630102]/[0.03] px-1.5 py-1">
//               <button onClick={() => removeFromCart(item.id)} className="rounded-full px-2 py-0.5 text-[#630102] transition hover:bg-[#630102]/10">-</button>
//               <span className="text-sm font-medium text-[#1a0000]">{quantity}</span>
//               <button onClick={() => addToCart(item)} className="rounded-full px-2 py-0.5 text-[#630102] transition hover:bg-[#630102]/10">+</button>
//             </div>
//           ) : (
//             <button 
//               onClick={() => addToCart(item)}
//               className="rounded-full px-4 py-1 text-xs font-medium text-white transition active:scale-95"
//               style={{ backgroundColor: primaryColor }}
//             >
//               Add
//             </button>
//           )
//         ) : (
//           <span className="text-[10px] font-bold text-red-500 uppercase">Sold out</span>
//         )}
//       </div>
//     </div>
//   );
// }
