import { createClient } from "@/lib/supabase/server";
import JerseyCard, { type Jersey } from "@/components/JerseyCard";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  const q = searchParams.q?.trim();

  let query = supabase
    .from("jerseys")
    .select("id,title,university,size,price,image_url,status")
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(60);

  if (q) query = query.ilike("title", `%${q}%`);

  const { data } = await query;
  const jerseys = (data ?? []) as Jersey[];

  return (
    <div>
      <section className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          University jerseys, bought & sold.
        </h1>
        <p className="mt-2 text-neutral-500">
          Thailand&apos;s home for buying and selling university jerseys.
        </p>
        <form className="mt-6 flex gap-2" action="/">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by team or university…"
            className="input max-w-md"
          />
          <button className="btn">Search</button>
        </form>
      </section>

      {jerseys.length === 0 ? (
        <p className="text-neutral-500">
          No jerseys yet. Be the first to list one!
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {jerseys.map((j) => (
            <JerseyCard key={j.id} jersey={j} />
          ))}
        </div>
      )}
    </div>
  );
}
