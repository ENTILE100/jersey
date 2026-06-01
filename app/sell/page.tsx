"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const router = useRouter();
  const supabase = createClient();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    title: "",
    university: "",
    size: "",
    condition: "Used",
    price: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);

  // Only logged-in users may sell.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      else setReady(true);
    });
  }, [router, supabase]);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    let image_url: string | null = null;
    if (file) {
      // Match the server rules: images only, max 5 MB.
      const okTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!okTypes.includes(file.type)) {
        setMsg("Please upload a JPG, PNG, WEBP or GIF image.");
        setBusy(false);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMsg("Image is too big (max 5 MB).");
        setBusy(false);
        return;
      }
      // Strip risky characters from the filename.
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("jerseys")
        .upload(path, file);
      if (upErr) {
        setMsg("Image upload failed: " + upErr.message);
        setBusy(false);
        return;
      }
      image_url = supabase.storage.from("jerseys").getPublicUrl(path)
        .data.publicUrl;
    }

    const { error } = await supabase.from("jerseys").insert({
      seller_id: user.id,
      title: form.title,
      university: form.university || null,
      size: form.size || null,
      condition: form.condition || null,
      price: parseInt(form.price || "0", 10),
      description: form.description || null,
      image_url,
    });

    if (error) {
      setMsg(error.message);
      setBusy(false);
    } else {
      router.push("/profile");
      router.refresh();
    }
  }

  if (!ready) return <p className="text-neutral-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold">List a jersey</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">Title *</label>
          <input
            className="input"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Chula Engineering jersey 2023"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">University</label>
            <input
              className="input"
              value={form.university}
              onChange={(e) => set("university", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Size</label>
            <input
              className="input"
              value={form.size}
              onChange={(e) => set("size", e.target.value)}
              placeholder="M / L / XL"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Condition</label>
            <select
              className="input"
              value={form.condition}
              onChange={(e) => set("condition", e.target.value)}
            >
              <option>New</option>
              <option>Like new</option>
              <option>Used</option>
            </select>
          </div>
          <div>
            <label className="label">Price (฿) *</label>
            <input
              className="input"
              type="number"
              required
              min={0}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-28"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <button className="btn w-full" disabled={busy}>
          {busy ? "Posting…" : "Post listing"}
        </button>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
      </form>
    </div>
  );
}
