import type { Metadata } from "next";
import "../globals.css";

import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";

import ProtectedLayout from "@/components/ProtectedLayout";

export const metadata: Metadata = {
  title: "WK Test",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedLayout>
      <Sidebar />
      <div className="sm:ml-15">{children}</div>
      <Toaster />
    </ProtectedLayout>
  );
}
