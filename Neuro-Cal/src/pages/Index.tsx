import { SmartCalendar } from "@/components/SmartCalendar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut, User, LogIn } from "lucide-react";

const Index = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">NeuroCal</h1>
              <span className="text-muted-foreground">Smart AI Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              {!isLoading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Logout</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link to="/auth">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <SmartCalendar />
    </div>
  );
};

export default Index;
