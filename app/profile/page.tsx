"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Row = {
  id: string;
  title: string;
  price: number;
  status: string | null;
  image_url: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [phoneMsg, setPhoneMsg] = useState("");

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data } = await supabase
      .from("jerseys")
      .select("id,title,price,status,image_url")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);

    const { data: contact } = await supabase
      .from("seller_contacts")
      .select("phone")
      .eq("id", user.id)
      .single();
    setPhone(contact?.phone ?? "");
    setLoading(false);
  }

  async function savePhone() {
    setPhoneMsg("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("seller_contacts")
      .update({ phone: phone.trim() || null })
      .eq("id", user.id);
    setPhoneMsg(error ? error.message : "Saved.");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleSold(r: Row) {
    await supabase
      .from("jerseys")
      .update({ status: r.status === "sold" ? "available" : "sold" })
      .eq("id", r.id);
    load();
  }

  async function remove(r: Row) {
    if (!confirm("Delete this listing?")) return;
    // Also delete the photo from storage so nothing is left orphaned.
    if (r.image_url) {
      const marker = "/jerseys/";
      const i = r.image_url.indexOf(marker);
      if (i !== -1) {
        const path = r.image_url.slice(i + marker.length);
        await supabase.storage.from("jerseys").remove([path]);
      }
    }
    await supabase.from("jerseys").delete().eq("id", r.id);
    load();
  }

  if (loading) return <p className="text-neutral-500">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My listings</h1>
        <Link href="/sell" className="btn">
          + Sell
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 p-5">
        <label className="label">Contact number (shown to logged-in buyers)</label>
        <div className="flex gap-2">
          <input
            className="input max-w-xs"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08x-xxx-xxxx"
          />
          <button onClick={savePhone} className="btn-ghost">
            Save
          </button>
        </div>
        {phoneMsg && (
          <p className="mt-2 text-sm text-neutral-500">{phoneMsg}</p>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-neutral-500">You haven&apos;t listed anything yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-3"
            >
              <div className="h-16 w-16 overflow-hidden rounded-xl bg-soft">
                {r.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.image_url}
                    alt={r.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-neutral-500">
                  ฿{r.price.toLocaleString()} ·{" "}
                  {r.status === "sold" ? "Sold" : "Available"}
                </p>
              </div>
              <button onClick={() => toggleSold(r)} className="btn-ghost">
                {r.status === "sold" ? "Mark available" : "Mark sold"}
              </button>
              <button
                onClick={() => remove(r)}
                className="btn-ghost text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
