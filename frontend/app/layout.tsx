// app/layout.tsx - Layout para a página inicial
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex mt-6 items-center justify-center">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
