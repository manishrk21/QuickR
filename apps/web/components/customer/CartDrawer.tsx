"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";

export function CartDrawer({ isOpen, onClose, slug, primaryColor, tableId, existingOrderId }: { 
  isOpen: boolean; 
  onClose: () => void; 
  slug: string; 
  primaryColor: string;
  tableId: string | null; // Receive from props
  existingOrderId?: string | null;
}) {
  const { cart, tableId: storeTableId, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cookieTableId = typeof document !== "undefined"
    ? document.cookie
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("qr_table="))
        ?.split("=")[1] ?? null
    : null;

  const resolvedTableId = tableId ?? storeTableId ?? cookieTableId;
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isExistingOrderMode = Boolean(existingOrderId);

  const placeOrder = async () => {
    if (!resolvedTableId) {
      alert("System could not detect your table. Please refresh the page.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_id: resolvedTableId,
          items: cart.map((item) => ({
            menu_item_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order failed");

      clearCart();
      router.push(`/r/${slug}/order/${data.order_id}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToExistingOrder = async () => {
    if (!existingOrderId) {
      alert("Missing order reference.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/customer/orders/${existingOrderId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            menu_item_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add items");

      clearCart();
      onClose();
      router.push(`/r/${slug}/order/${existingOrderId}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">
            {isExistingOrderMode ? "These items will be added to your existing order" : "Your Order"}
          </h2>
          <button onClick={onClose} className="text-slate-400 font-bold">✕</button>
        </div>
        
        <div className="space-y-4 mb-6">
          {cart.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="font-medium">{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
              <span className="font-bold">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        <button 
          onClick={isExistingOrderMode ? addToExistingOrder : placeOrder}
          disabled={loading || cart.length === 0}
          className="w-full py-4 mt-6 rounded-xl text-white font-bold transition-all active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          {loading
            ? isExistingOrderMode
              ? "Adding items..."
              : "Placing Order..."
            : isExistingOrderMode
              ? "Add to existing order"
              : "Confirm & Place Order"}
        </button>
      </div>
    </div>
  );
}