import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, "admin");
    if (limited) return limited;

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const { data: member } = await supabase
      .from("tenant_members")
      .select("restaurant_id")
      .eq("user_id", session.user.id)
      .single();

    if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Safe buffer transition for local machine runtime streams
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 2. Clear out any sharp cache fragments before starting optimization
    sharp.cache(false);

    // 3. Process the file stream into optimized webp parameters
    const optimizedBuffer = await sharp(inputBuffer)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // 4. Secure flat path naming string
    const filename = `${member.restaurant_id}-${crypto.randomUUID()}.webp`;

    // 5. Store file inside the public bucket
    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filename, optimizedBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload handler caught error:", error);
    return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
  }
}
