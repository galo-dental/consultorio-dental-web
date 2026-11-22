import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestión Consultorio Dental",
  description: "Sistema clínico, agenda, pagos e inventario",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
