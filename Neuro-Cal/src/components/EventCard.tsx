import { Clock, MapPin, Users, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { memo, useCallback } from "react";

export interface Event {
  id: string;
  title: string;
  time: string;
  duration: string;
  date?: Date;
  location?: string;
  attendees?: string[];
  color: string;
  isAiSuggested?: boolean;
  type: "meeting" | "focus" | "break" | "travel";
}

interface EventCardProps {
  event: Event;
  className?: string;
}

export const EventCard = memo(({ event, className = "" }: EventCardProps) => {
  const isMobile = useIsMobile();

  const getEventIcon = useCallback(() => {
    switch (event.type) {
      case "meeting":
        return <Users className="w-3 h-3" />;
      case "focus":
        return <Clock className="w-3 h-3" />;
      case "break":
        return <Sparkles className="w-3 h-3" />;
      case "travel":
        return <MapPin className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  }, [event.type]);

  return (
    <div className={`
      relative ${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-card border border-border 
      hover:shadow-md transition-all duration-200 cursor-pointer
      ${event.isAiSuggested ? 'ring-1 ring-primary/20 bg-gradient-ai' : ''}
      ${className}
    `}>
      {event.isAiSuggested && (
        <div className="absolute -top-1 -right-1">
          <Badge variant="secondary" className="text-xs bg-primary text-primary-foreground">
            <Sparkles className="w-2 h-2 mr-1" />
            AI
          </Badge>
        </div>
      )}
      
      <div className="flex items-start gap-2">
        <div className={`w-3 h-3 rounded-full mt-1 ${event.color}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} text-foreground truncate`}>
            {event.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            {getEventIcon()}
            <span>{event.time}</span>
            <span>•</span>
            <span>{event.duration}</span>
          </div>
          {event.location && !isMobile && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          {event.attendees && event.attendees.length > 0 && !isMobile && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{event.attendees.length} attendees</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';