import { redirect } from "next/navigation";

export default async function ScanPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { t?: string };
}) {
  const token = searchParams.t;

  if (!token) {
    redirect(`/r/${params.slug}`);
  }

  redirect(`/api/customer/verify-table?t=${encodeURIComponent(token)}&slug=${params.slug}`);
}
