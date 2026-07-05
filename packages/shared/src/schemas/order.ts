import { z } from "zod";

export const OrderStatusSchema = z.enum([
  "pending",
  "accepted",
  "preparing",
  "ready",
  "served",
  "paid",
  "cancelled",
]);

export const OrderItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(50),
  special_instructions: z.string().max(200).optional(),
});

export const PlaceOrderSchema = z.object({
  table_id: z.string().uuid(),
  items: z.array(OrderItemSchema).min(1).max(30),
  special_instructions: z.string().max(500).optional(),
});

export const AddItemsToOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1).max(20),
});

export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["served"],
  served: ["paid"],
  paid: [],
  cancelled: [],
};
