import { SmartCalendar } from "@/components/SmartCalendar";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
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
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <SmartCalendar />
    </div>
  );
};

export default Index;
