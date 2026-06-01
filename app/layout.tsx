import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "JerseyDek — Buy & sell university jerseys",
  description: "Thailand's marketplace for university jerseys.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container-page py-8">{children}</main>
        <footer className="container-page border-t border-neutral-200 py-10 text-sm text-neutral-500">
          JerseyDek — buy & sell university jerseys in Thailand.
        </footer>
      </body>
    </html>
  );
}
