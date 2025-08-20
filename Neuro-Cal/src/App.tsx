import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import Index from "./pages/Index";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import CRMDashboard from "./components/CRMDashboard";
import NeuroCalMain from "./components/NeuroCalMain";


const App = () => {
  return (
    <GlobalErrorBoundary>
      <Router>
        <AuthProvider>
          <AnalyticsProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<AnalyticsDashboard />} />
              <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
              <Route path="/crm" element={<CRMDashboard />} />
              <Route path="/main" element={<NeuroCalMain />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </AnalyticsProvider>
        </AuthProvider>
      </Router>
    </GlobalErrorBoundary>
  );
};

export default App;
