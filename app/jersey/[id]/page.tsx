import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function JerseyDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: jersey } = await supabase
    .from("jerseys")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!jersey) notFound();

  // Public profile info (safe for anyone to see).
  const { data: seller } = await supabase
    .from("profiles")
    .select("display_name, university")
    .eq("id", jersey.seller_id)
    .single();

  // Phone lives in a protected table — only returned when the viewer is
  // logged in. Anonymous visitors get null and see a "log in" prompt.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let phone: string | null = null;
  if (user) {
    const { data: contact } = await supabase
      .from("seller_contacts")
      .select("phone")
      .eq("id", jersey.seller_id)
      .single();
    phone = contact?.phone ?? null;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-2xl bg-soft">
        {jersey.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={jersey.image_url}
            alt={jersey.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            No photo
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{jersey.title}</h1>
        <p className="mt-1 text-neutral-500">
          {jersey.university || "—"}
          {jersey.size ? ` · Size ${jersey.size}` : ""}
          {jersey.condition ? ` · ${jersey.condition}` : ""}
        </p>
        <p className="mt-4 text-3xl font-semibold">
          ฿{jersey.price.toLocaleString()}
        </p>

        {jersey.description && (
          <p className="mt-6 whitespace-pre-wrap text-neutral-700">
            {jersey.description}
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm font-medium">Seller</p>
          <p className="text-neutral-700">{seller?.display_name || "Member"}</p>
          {user ? (
            phone ? (
              <p className="mt-1 text-sm text-neutral-500">Contact: {phone}</p>
            ) : (
              <p className="mt-1 text-sm text-neutral-400">
                No contact number provided.
              </p>
            )
          ) : (
            <a href="/login" className="mt-1 inline-block text-sm underline">
              Log in to see contact
            </a>
          )}
          <p className="mt-3 text-xs text-neutral-400">
            Meet in a safe public place. Check the jersey before you pay.
          </p>
        </div>
      </div>
    </div>
  );
}
