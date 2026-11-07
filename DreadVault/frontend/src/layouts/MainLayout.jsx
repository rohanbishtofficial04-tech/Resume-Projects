import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { OfflineBanner } from "@/components/OfflineBanner";
import { MissingKeyBanner } from "@/components/MissingKeyBanner";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Toaster } from "sonner";
import { TID } from "@/constants/testIds";

export const MainLayout = () => {
  useScrollToTop();
  return (
    <div className="nf-grain nf-vignette min-h-screen">
      <Navbar />
      <MissingKeyBanner />
      <OfflineBanner />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <Toaster
        data-testid={TID.toaster}
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--nf-surface)",
            border: "1px solid var(--nf-border)",
            color: "var(--nf-text)",
            borderRadius: "0px",
            fontFamily: "Oswald, sans-serif",
            letterSpacing: "0.08em",
            fontSize: "12px",
            textTransform: "uppercase",
          },
        }}
      />
    </div>
  );
};
