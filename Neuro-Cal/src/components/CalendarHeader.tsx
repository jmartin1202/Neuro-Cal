import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-gradient-card border-b border-border space-y-4 md:space-y-0">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {isMobile ? 'NeuroCal' : 'Smart Calendar'}
            </h1>
            <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
              <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size={isMobile ? "sm" : "sm"} onClick={onPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-[150px] md:min-w-[200px] text-center">
            <h2 className="text-lg md:text-xl font-semibold">
              {isMobile ? `${currentMonth} ${currentYear}` : `${currentMonth} ${currentYear}`}
            </h2>
          </div>
          <Button variant="outline" size={isMobile ? "sm" : "sm"} onClick={onNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex bg-secondary rounded-lg p-1">
          {(["month", "week", "day"] as const).map((viewType) => (
            <Button
              key={viewType}
              variant={view === viewType ? "default" : "ghost"}
              size={isMobile ? "sm" : "sm"}
              onClick={() => onViewChange(viewType)}
              className="capitalize text-xs md:text-sm"
            >
              {isMobile ? viewType.charAt(0).toUpperCase() : viewType}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};