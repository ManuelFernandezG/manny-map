import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Landing = lazy(() => import("./pages/Landing"));
const Splash = lazy(() => import("./pages/Splash"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Ratings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

function useThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem("mannymap_theme");

    if (stored === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      document.documentElement.classList.toggle("dark", mq.matches);
      const onChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } else {
      // null defaults to "dark" to preserve existing behavior
      document.documentElement.classList.toggle("dark", stored !== "light");
    }
  }, []);
}

const App = () => {
  useThemeInit();
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Suspense fallback={<div className="min-h-screen bg-[#1A2E22]" />}><Landing /></Suspense>} />
          <Route path="/map" element={<Index />} />
          <Route path="/profile" element={<Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-foreground font-display">Loading profile...</p></div>}><Profile /></Suspense>} />
          <Route path="/ratings" element={<Suspense fallback={<div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center"><p className="text-black font-['DM_Sans']">Loading ratings...</p></div>}><Dashboard /></Suspense>} />
          <Route path="/splash" element={<Suspense fallback={<div className="min-h-screen bg-[#1A3A2A]" />}><Splash /></Suspense>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
