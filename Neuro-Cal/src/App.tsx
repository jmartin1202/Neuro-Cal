import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { DeveloperAnalytics } from "@/components/DeveloperAnalytics";
import { ProtectedRoute } from "@/components/ProtectedRoute";
// import { SupabaseExample } from "@/components/SupabaseExample";
import { SimpleTest } from "@/components/SimpleTest";
import NotFound from "./pages/NotFound";
import NeurocalAuth from "./components/auth/NeurocalAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/signin" element={<NeurocalAuth />} />
          <Route path="/dev-analytics" element={
            <ProtectedRoute password="neurocal2024">
              <DeveloperAnalytics />
            </ProtectedRoute>
          } />
          {/* <Route path="/supabase-demo" element={<SupabaseExample />} /> */}
          <Route path="/test" element={<SimpleTest />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
