"use client";

// apps/web/components/admin/counter/CounterClient.tsx

import { useState, useMemo } from "react";
import { FoodTypeIndicator } from "@/components/FoodTypeIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  Search,
  User,
  Phone,
  X,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  food_type: "veg" | "non_veg" | "egg";
  is_available: boolean;
  category_id: string;
  image_url: string | null;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
}

interface Table {
  id: string;
  label: string;
}

interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  food_type: "veg" | "non_veg" | "egg";
  quantity: number;
}

interface CounterClientProps {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    primary_color: string;
  };
  categories: Category[];
  items: MenuItem[];
  tables: Table[];
}

type PaymentMethod = "cash" | "upi" | "card" | "other";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  other: "Other",
};

export function CounterClient({
  restaurant,
  categories,
  items,
  tables,
}: CounterClientProps) {
  const primary = restaurant.primary_color || "#7c3aed";

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Customer info
  const [mobile, setMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [tableId, setTableId] = useState<string>("none");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // UI state
  const [activeCategory, setActiveCategory] = useState("");   //useState(categories[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState<{ orderId: string; total: number } | null>(null);
  const [error, setError] = useState("");

  // Derived
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  //const filteredItems = useMemo(() => {
  //   const base = search
  //     ? items.filter((i) =>
  //         i.name.toLowerCase().includes(search.toLowerCase())
  //       )
  //     : items.filter((i) => i.category_id === activeCategory);
  //   return base;
  // }, [items, search, activeCategory]);
  const filteredItems = useMemo(() => {
    if (search) {
      return items.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activeCategory === "") {
      return items; // Returns everything when "All" is active
    }
    return items.filter((i) => i.category_id === activeCategory);
  }, [items, search, activeCategory]);

  // Cart ops
  function addItem(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menu_item_id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          food_type: item.food_type,
          quantity: 1,
        },
      ];
    });
  }

  function updateQty(menu_item_id: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.menu_item_id !== menu_item_id));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.menu_item_id === menu_item_id ? { ...i, quantity: qty } : i
        )
      );
    }
  }

  function getQty(itemId: string) {
    return cart.find((i) => i.menu_item_id === itemId)?.quantity ?? 0;
  }

  function resetAll() {
    setCart([]);
    setMobile("");
    setCustomerName("");
    setTableId("none");
    setPaymentMethod("cash");
    setSpecialInstructions("");
    setSearch("");
    setError("");
  }

  async function handlePlaceOrder() {
    if (cart.length === 0) return;
    setPlacing(true);
    setError("");

    const res = await fetch("/api/admin/counter/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurant_id: restaurant.id,
        table_id: tableId !== "none" ? tableId : null,
        mobile: mobile.length === 10 ? mobile : null,
        customer_name: customerName || null,
        payment_method: paymentMethod,
        special_instructions: specialInstructions || null,
        items: cart.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
        })),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "Failed to place order. Try again."
      );
      setPlacing(false);
      return;
    }

    setSuccess({ orderId: data.order_id, total: data.total });
    setCartOpen(false);
    setPlacing(false);
  }

  // Success screen
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: primary + "20" }}
        >
          <CheckCircle2 size={40} style={{ color: primary }} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Order placed!</h1>
        <p className="text-slate-500 mt-2 text-sm">
          Order #{success.orderId.slice(0, 8).toUpperCase()} · ₹
          {success.total.toFixed(0)}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Sent to kitchen as{" "}
          <span className="font-medium text-blue-600">Accepted</span>
        </p>

        <div className="flex gap-3 mt-8">
          <Button
            onClick={() => {
              setSuccess(null);
              resetAll();
            }}
            style={{ background: primary, color: "#fff" }}
          >
            New order
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = `/admin/${restaurant.slug}/orders`)
            }
          >
            View orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Counter order</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Place orders on behalf of walk-in customers.
          </p>
        </div>

        {/* Cart button — visible on all sizes */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: primary }}
        >
          <ShoppingCart size={16} />
          <span>Cart</span>
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-xs font-bold flex items-center justify-center"
              style={{ color: primary }}>
              {itemCount}
            </span>
          )}
          {total > 0 && (
            <span className="ml-1 bg-white/20 rounded-lg px-2 py-0.5 text-xs">
              ₹{total.toFixed(0)}
            </span>
          )}
        </button>
      </div>

      {/* Two-column layout on large screens, stacked on mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* ── LEFT: Menu ──────────────────────────────────────────────── */}
        <div>
          {/* Search */}
          <div className="relative mb-4">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search menu…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value) setActiveCategory("");
              }}
              className="pl-9"
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setSearch("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category pills — Always visible */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
            {/* "All" Option Pill */}
            <button
              onClick={() => {
                setActiveCategory("");
                setSearch(""); // Automatically clears search context
              }}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
              style={
                activeCategory === "" && !search
                  ? { background: primary, color: "#fff" }
                  : { background: "#f1f5f9", color: "#475569" }
              }
            >
              All Items
            </button>
          
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearch(""); // Automatically clears search context
                }}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
                style={
                  activeCategory === cat.id && !search
                    ? { background: primary, color: "#fff" }
                    : { background: "#f1f5f9", color: "#475569" }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
    
          {/* Menu items grid */}
          {filteredItems.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl py-12 text-center">
              <p className="text-slate-400 text-sm">
                {search ? `No items match "${search}"` : "No items in this category."}
              </p>
            </div>
          ) : (
            /* Changed grid-cols-1 to grid-cols-2 to force two columns on mobile */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredItems.map((item) => {
                const qty = getQty(item.id);
                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-2 bg-white flex flex-col transition-all  ${
                      qty > 0
                        ? "border-slate-300 ring-1 ring-slate-200"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    {/* ROW 1: Food Indicator + Item Name */}
                    <div className="flex items-start gap-1.5 min-w-0">
                      <FoodTypeIndicator type={item.food_type} size="sm" />
                      <p className="font-semibold text-xs text-slate-900 leading-tight line-clamp-2">
                        {item.name}
                      </p>
                    </div>

                    {/* ROW 2: Price & Add Button / Qty Actions (No Description) */}
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 shrink-0">
                        ₹{item.price.toFixed(0)}
                      </p>

                      <div className="shrink-0">
                        {qty === 0 ? (
                          <button
                            onClick={() => addItem(item)}
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded border transition-colors"
                            style={{ borderColor: primary, color: primary }}
                          >
                            ADD
                          </button>
                        ) : (
                          <div
                            className="flex items-center gap-1.5 rounded px-1 py-0.5"
                            style={{ background: primary + "15" }}
                          >
                            <button
                              onClick={() => updateQty(item.id, qty - 1)}
                              className="rounded transition-opacity hover:opacity-70"
                              style={{ color: primary }}
                            >
                              {qty === 1 ? (
                                <Trash2 size={12} />
                              ) : (
                                <Minus size={12} />
                              )}
                            </button>
                            <span
                              className="text-xs font-bold w-3 text-center"
                              style={{ color: primary }}
                            >
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, qty + 1)}
                              className="rounded transition-opacity hover:opacity-70"
                              style={{ color: primary }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

       
        
        {/* ── RIGHT: Order details panel (desktop sidebar) ─────────────── */}
        <div className="hidden xl:flex flex-col gap-4">
          <OrderDetailsPanel
            cart={cart}
            tables={tables}
            mobile={mobile}
            setMobile={setMobile}
            customerName={customerName}
            setCustomerName={setCustomerName}
            tableId={tableId}
            setTableId={setTableId}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            specialInstructions={specialInstructions}
            setSpecialInstructions={setSpecialInstructions}
            total={total}
            placing={placing}
            error={error}
            primary={primary}
            onPlaceOrder={handlePlaceOrder}
            onUpdateQty={updateQty}
          />
        </div>
      </div>

      {/* ── Mobile cart sheet ─────────────────────────────────────────── */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="h-full w-full sm:max-w-md px-0">
          <SheetHeader className="px-5 pb-3 border-b">
            <SheetTitle className="flex items-center gap-2 text-base">
              <ShoppingCart size={18} />
              Counter order
            </SheetTitle>
          </SheetHeader>
          {/* REPLACED Shadcn ScrollArea with standard HTML scroll wrapper */}
          <div className="h-[calc(100vh-64px)] overflow-y-auto no-scrollbar">
            <div className="px-5 py-4">
              <OrderDetailsPanel
                cart={cart}
                tables={tables}
                mobile={mobile}
                setMobile={setMobile}
                customerName={customerName}
                setCustomerName={setCustomerName}
                tableId={tableId}
                setTableId={setTableId}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                specialInstructions={specialInstructions}
                setSpecialInstructions={setSpecialInstructions}
                total={total}
                placing={placing}
                error={error}
                primary={primary}
                onPlaceOrder={handlePlaceOrder}
                onUpdateQty={updateQty}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ── Order details panel (shared between desktop sidebar + mobile sheet) ── */

interface OrderDetailsPanelProps {
  cart: CartItem[];
  tables: Table[];
  mobile: string;
  setMobile: (v: string) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  tableId: string;
  setTableId: (v: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (v: PaymentMethod) => void;
  specialInstructions: string;
  setSpecialInstructions: (v: string) => void;
  total: number;
  placing: boolean;
  error: string;
  primary: string;
  onPlaceOrder: () => void;
  onUpdateQty: (id: string, qty: number) => void;
}

function OrderDetailsPanel({
  cart,
  tables,
  mobile,
  setMobile,
  customerName,
  setCustomerName,
  tableId,
  setTableId,
  paymentMethod,
  setPaymentMethod,
  specialInstructions,
  setSpecialInstructions,
  total,
  placing,
  error,
  primary,
  onPlaceOrder,
  onUpdateQty,
}: OrderDetailsPanelProps) {
  return (
    <div className="space-y-4">

      {/* Cart items */}
      <div className="border rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-3 border-b bg-slate-50">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Items {cart.length > 0 && `· ${cart.reduce((s, i) => s + i.quantity, 0)} pcs`}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <ShoppingCart size={28} className="mx-auto mb-2 text-slate-200" />
            <p className="text-xs text-slate-400">
              Add items from the menu
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {cart.map((item) => (
              <div key={item.menu_item_id} className="flex items-center gap-3 px-4 py-2.5">
                <FoodTypeIndicator type={item.food_type} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    ₹{item.price.toFixed(0)} × {item.quantity} ={" "}
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateQty(item.menu_item_id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-400 transition-colors"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 size={11} />
                    ) : (
                      <Minus size={11} />
                    )}
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.menu_item_id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-400 transition-colors"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between px-4 py-3 bg-slate-50">
              <span className="text-sm font-semibold text-slate-700">Total</span>
              <span className="text-sm font-bold text-slate-900">
                ₹{total.toFixed(0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Customer info */}
      <div className="border rounded-xl bg-white px-4 py-4 space-y-3">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
          Customer (optional)
        </p>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 flex items-center gap-1.5">
            <Phone size={11} /> Mobile
          </Label>
          <div className="flex gap-2">
            <span className="flex items-center px-3 border rounded-lg bg-slate-50 text-slate-500 text-sm shrink-0">
              +91
            </span>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="9876543210"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="flex-1"
            />
          </div>
          <p className="text-xs text-slate-400">
            Enter to save customer and track loyalty
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 flex items-center gap-1.5">
            <User size={11} /> Name
          </Label>
          <Input
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
      </div>

      {/* Table + Payment */}
      <div className="border rounded-xl bg-white px-4 py-4 space-y-3">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
          Order details
        </p>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Table</Label>
          <Select value={tableId} onValueChange={setTableId}>
            <SelectTrigger>
              <SelectValue placeholder="Select table or takeaway" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Takeaway / No table</SelectItem>
              {tables.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Payment method</Label>
          <div className="grid grid-cols-4 gap-2">
            {(["cash", "upi", "card", "other"] as PaymentMethod[]).map((pm) => (
              <button
                key={pm}
                type="button"
                onClick={() => setPaymentMethod(pm)}
                className="py-2 rounded-lg border text-xs font-medium transition-all"
                style={
                  paymentMethod === pm
                    ? {
                        background: primary,
                        color: "#fff",
                        borderColor: primary,
                      }
                    : {
                        background: "#fff",
                        color: "#64748b",
                        borderColor: "#e2e8f0",
                      }
                }
              >
                {PAYMENT_LABELS[pm]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Note (optional)</Label>
          {/* REPLACED Shadcn Textarea with custom styled native HTML textarea */}
          <textarea
            placeholder="Spice level, allergies, special requests…"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-slate-200 resize-none"
            rows={2}
            maxLength={500}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Place order */}
      <Button
        className="w-full h-11 text-sm font-semibold"
        style={{ background: primary, color: "#fff" }}
        disabled={cart.length === 0 || placing}
        onClick={onPlaceOrder}
      >
        {placing
          ? "Placing order…"
          : cart.length === 0
          ? "Add items to place order"
          : `Place order · ₹${total.toFixed(0)}`}
      </Button>

      <p className="text-center text-xs text-slate-400">
        Counter orders go straight to kitchen as{" "}
        <span className="font-medium text-blue-600">Accepted</span>
      </p>
    </div>
  );
}
