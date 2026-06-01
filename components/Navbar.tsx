import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Jersey<span className="text-neutral-400">Dek</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/sell" className="btn">
                + Sell
              </Link>
              <Link href="/profile" className="btn-ghost">
                My listings
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="btn">
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
