import { createHmac } from "crypto";

const SECRET = process.env.QR_TOKEN_SECRET!;

export function generateTableToken(tableId: string, restaurantId: string): string {
  const payload = `${tableId}:${restaurantId}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyTableToken(
  token: string
): { tableId: string; restaurantId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split("|");
    if (parts.length !== 2) return null;

    const [payload, sig] = parts;
    const expectedSig = createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex");

    if (sig !== expectedSig) return null;

    const [tableId, restaurantId] = payload.split(":");
    if (!tableId || !restaurantId) return null;

    return { tableId, restaurantId };
  } catch {
    return null;
  }
}
