import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SpendWiseProvider } from "@/components/spendwise/SpendWiseProvider";
import StorageNotice from "@/components/spendwise/StorageNotice";
import DemoModeBanner from "@/components/spendwise/DemoModeBanner";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpendWise",
  description: "A clearer view of your money. Track spending, manage budgets, and build better financial habits.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SpendWiseProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
              <AppSidebar />
              <main className="min-w-0 flex-1">
                <Navbar />
                <DemoModeBanner />
                <StorageNotice />
                <div className="px-4 pt-6 sm:px-7">{children}</div>
              </main>
            </SidebarProvider>
          </SpendWiseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
