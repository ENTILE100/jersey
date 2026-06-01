import Link from "next/link";

export type Jersey = {
  id: string;
  title: string;
  university: string | null;
  size: string | null;
  price: number;
  image_url: string | null;
  status: string | null;
};

export default function JerseyCard({ jersey }: { jersey: Jersey }) {
  return (
    <Link
      href={`/jersey/${jersey.id}`}
      className="group block overflow-hidden rounded-2xl border border-neutral-200 transition hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-soft">
        {jersey.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={jersey.image_url}
            alt={jersey.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            No photo
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="truncate text-sm font-medium">{jersey.title}</p>
        <p className="truncate text-xs text-neutral-500">
          {jersey.university || "—"} {jersey.size ? `· ${jersey.size}` : ""}
        </p>
        <p className="mt-2 font-semibold">฿{jersey.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
