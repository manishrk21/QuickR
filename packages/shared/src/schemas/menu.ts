import { z } from "zod";

export const FoodTypeSchema = z.enum(["veg", "non_veg", "egg"]);

export const MenuItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive().multipleOf(0.01),
  food_type: FoodTypeSchema,
  category_id: z.string().uuid(),
  allergens: z.array(z.string()).max(10).optional(),
  is_available: z.boolean().default(true),
});

export const CategorySchema = z.object({
  name: z.string().min(1).max(60),
  display_order: z.number().int().min(0),
});
