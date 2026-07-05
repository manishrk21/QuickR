

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
  const indicatorColor = (item.food_type === 'veg') ? 'bg-green-500' : 'bg-red-500';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);

  if (!isAvailable) return null;

  return (
    <div
      ref={cardRef}
      className="grid grid-cols-[auto,1fr,auto] items-center gap-3 rounded-2xl border border-[#630102]/10 bg-[#EDEBDE] px-3 py-3 shadow-sm transition-all duration-500 sm:gap-4 sm:px-4"
    >
      {/* Image */}
      <div className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#630102]/10 bg-[#630102]/[0.03] transition-all duration-500 ${isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}>
        {item.signedImageUrl ? (
          <img
            src={item.signedImageUrl}
            alt={item.name}
            className={`h-full w-full object-cover transition-transform duration-700 ${isVisible ? "scale-100" : "scale-110"}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[8px] text-[#630102]/25">No Img</div>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 pr-1">
        <h3 className="truncate font-semibold text-[#1a0000]">{item.name}</h3>
        <p className="line-clamp-1 text-xs text-[#630102]/55">{item.description}</p>
      </div>

      {/* Indicator */}
      <div className={`w-3 h-3 rounded-sm shrink-0 ${indicatorColor}`} />

      {/* Price & Quantity Controls */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-bold text-[#1a0000]">₹{item.price}</span>
        
        {isAvailable ? (
          quantity > 0 ? (
            <div className="flex items-center gap-2 rounded-full border border-[#630102]/10 bg-[#630102]/[0.03] px-1.5 py-1">
              <button onClick={() => removeFromCart(item.id)} className="rounded-full px-2 py-0.5 text-[#630102] transition hover:bg-[#630102]/10">-</button>
              <span className="text-sm font-medium text-[#1a0000]">{quantity}</span>
              <button onClick={() => addToCart(item)} className="rounded-full px-2 py-0.5 text-[#630102] transition hover:bg-[#630102]/10">+</button>
            </div>
          ) : (
            <button 
              onClick={() => addToCart(item)}
              className="rounded-full px-4 py-1 text-xs font-medium text-white transition active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              Add
            </button>
          )
        ) : (
          <span className="text-[10px] font-bold text-red-500 uppercase">Sold out</span>
        )}
      </div>
    </div>
  );
}
