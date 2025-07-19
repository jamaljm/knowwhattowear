import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import {
  Roboto,
  Sora,
  Urbanist,
  DM_Sans,
  Manrope,
  Outfit,
  Quattrocento,
  Fustat,
} from "next/font/google";
import { headers } from "next/headers";
import { Providers } from "./providers";
import { CommonContextProvider } from "@/Common_context";
import { Toaster } from "@/components/ui/toaster";

const robotoFont = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const soraFont = Sora({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

const urbanistFont = Urbanist({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-urbanist",
});

const DM_SansFont = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const ManropeFont = Manrope({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const OutfitFont = Outfit({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const QuattrocentoFont = Quattrocento({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-quattrocento",
});

const FustatFont = Fustat({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fustat",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = ` ${robotoFont.variable} ${soraFont.variable} ${urbanistFont.variable} ${DM_SansFont.variable} ${ManropeFont.variable} ${OutfitFont.variable} ${QuattrocentoFont.variable} ${FustatFont.variable}`;
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="font-dmSans">
        <CommonContextProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <Providers>{children}</Providers>
            <Toaster />
          </ThemeProvider>
        </CommonContextProvider>
      </body>
    </html>
  );
}
