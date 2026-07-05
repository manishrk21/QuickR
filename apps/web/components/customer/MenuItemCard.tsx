

"use client";

import { useCartStore } from "@/store/cart";

export function MenuItemCard({ item, primaryColor }: any) {
  const { addToCart, removeFromCart, cart } = useCartStore();
  
  // Find quantity for this specific item
  const cartItem = cart?.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;
  
  const isAvailable = item.is_available ?? true;
  const indicatorColor = (item.food_type === 'veg') ? 'bg-green-500' : 'bg-red-500';

  if (!isAvailable) return null;

  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {/* Image */}
      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
        {item.signedImageUrl ? (
          <img src={item.signedImageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300">No Img</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
        <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
      </div>

      {/* Indicator */}
      <div className={`w-3 h-3 rounded-sm shrink-0 ${indicatorColor}`} />

      {/* Price & Quantity Controls */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="font-bold text-slate-900 text-sm">₹{item.price}</span>
        
        {isAvailable ? (
          quantity > 0 ? (
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <button onClick={() => removeFromCart(item.id)} className="px-2">-</button>
              <span className="font-medium text-sm">{quantity}</span>
              <button onClick={() => addToCart(item)} className="px-2">+</button>
            </div>
          ) : (
            <button 
              onClick={() => addToCart(item)}
              className="px-4 py-1 rounded-lg text-white font-medium text-xs"
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