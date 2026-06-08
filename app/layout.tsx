import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema de Tickets",
  description: "MVP web para gestionar tickets de soporte y mantenimiento.",
  icons: {
    icon: "/icon.svg?v=4"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
