import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CommonContextProvider } from "@/Common_context";

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],

});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Know what to wear",
  description: "No more confusion, just perfect outfits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <CommonContextProvider>
        <body
          className={`${dmSans.variable} ${geistMono.variable} font-dmsans antialiased`}
        >
          {children}
        </body>
      </CommonContextProvider>
    </html>
  );
}
