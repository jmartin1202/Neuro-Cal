import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";

const App = () => {
  return (
    <AuthProvider>
      <Index />
      <Toaster />
    </AuthProvider>
  );
};

export default App;
