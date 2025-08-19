import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  view: "month" | "week" | "day";
  onViewChange: (view: "month" | "week" | "day") => void;
}

export const CalendarHeader = ({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth, 
  view, 
  onViewChange 
}: CalendarHeaderProps) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <div className="flex items-center justify-between p-6 bg-gradient-card border-b border-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Smart Calendar
            </h1>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-[200px] text-center">
            <h2 className="text-xl font-semibold">
              {currentMonth} {currentYear}
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={onNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex bg-secondary rounded-lg p-1">
          {(["month", "week", "day"] as const).map((viewType) => (
            <Button
              key={viewType}
              variant={view === viewType ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange(viewType)}
              className="capitalize"
            >
              {viewType}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};