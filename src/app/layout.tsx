import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EmployeeProvider } from "@/context/EmployeeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dokumen Kontrak Kerja Apps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EmployeeProvider>{children}</EmployeeProvider>
      </body>
    </html>
  );
}
