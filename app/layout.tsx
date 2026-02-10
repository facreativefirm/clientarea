import type { Metadata } from "next";
import { Outfit, Tiro_Bangla } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { Toaster } from "sonner";
import { SettingsBootstrap } from "@/components/SettingsBootstrap";
import { FloatingPortal } from "@/components/shared/FloatingPortal";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const tiroBangla = Tiro_Bangla({
  weight: "400",
  subsets: ["bengali"],
  variable: "--font-tiro-bangla",
});

export const metadata: Metadata = {
  title: "FA Creative CRM | Production Ready",
  description: "Next-gen FA Creative CRM for hosting and services.",
  icons: {
    icon: "/Facreativefirmltd.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${tiroBangla.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsBootstrap>
            <LanguageProvider>
              {children}
              <FloatingPortal />
              <Toaster richColors position="top-right" />
            </LanguageProvider>
          </SettingsBootstrap>
        </ThemeProvider>
      </body>
    </html>
  );
}
