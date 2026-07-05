import { z } from "zod";

export const SendOtpSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  restaurant_id: z.string().uuid(),
});

export const VerifyOtpSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().length(6).regex(/^\d{6}$/),
  restaurant_id: z.string().uuid(),
  table_id: z.string().uuid(),
});
