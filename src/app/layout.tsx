import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seyha | Portfolio & Creative Space",
  description: "Portfolio landing page of Seyha - Creative Developer, CADT Year 4. Featuring today's song, featured video, and interactive fun.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
