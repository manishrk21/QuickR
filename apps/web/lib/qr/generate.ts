import QRCode from "qrcode";
import { generateTableToken } from "./tokens";

export async function generateTableQR(
  tableId: string,
  restaurantId: string,
  restaurantSlug: string,
  appUrl: string
): Promise<Buffer> {
  const token = generateTableToken(tableId, restaurantId);
  const qrUrl = new URL(`/r/${encodeURIComponent(restaurantSlug)}/scan`, appUrl);
  qrUrl.searchParams.set("t", token);

  // Generate as PNG buffer — uploaded securely to Supabase Storage
  const buffer = await QRCode.toBuffer(qrUrl.toString(), {
    type: "png",
    width: 400,
    margin: 2,
    color: {
      dark: "#09090b",   // Near-black dots matching design tokens
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });

  return buffer;
}
