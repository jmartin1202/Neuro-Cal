import { SmartCalendar } from "@/components/SmartCalendar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut, User, LogIn } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { user, logout, isLoading } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
            <div className="flex items-center gap-3 md:gap-4">
              <h1 className="text-xl md:text-2xl font-bold">NeuroCal</h1>
              <span className="text-sm md:text-base text-muted-foreground">Smart AI Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              {!isLoading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="flex items-center gap-2 text-xs md:text-sm">
                        <User className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLogout}
                        className="flex items-center gap-1 md:gap-2"
                      >
                        <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Logout</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link to="/signin">
                        <Button variant="outline" size="sm" className="flex items-center gap-1 md:gap-2">
                          <LogIn className="h-3 w-3 md:h-4 md:w-4" />
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
