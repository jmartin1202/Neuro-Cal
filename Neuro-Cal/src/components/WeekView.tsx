import React, { memo, useMemo } from "react";
import { Event } from "./EventCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  onDateClick: (date: Date) => void;
}

const WeekView = memo(({ currentDate, events, onDateClick }: WeekViewProps) => {
  const isMobile = useIsMobile();

  // Get the week data for the current date
  const weekData = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      if (!event.date) return false;
      return event.date.toDateString() === date.toDateString();
    });
  };

  // Time slots for the day
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);

  const formatTime = (hour: number) => {
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="flex-1 p-3 md:p-6 overflow-auto">
      {/* Week header */}
      <div className="grid grid-cols-8 gap-1 mb-4">
        <div className="p-2 text-xs md:text-sm font-medium text-muted-foreground">
          Time
        </div>
        {weekData.map((date) => (
          <div
            key={date.toISOString()}
            className={`p-2 text-center text-xs md:text-sm font-medium border rounded-lg cursor-pointer transition-colors ${
              isToday(date)
                ? 'bg-gradient-ai text-white border-calendar-today'
                : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
            }`}
            onClick={() => onDateClick(date)}
          >
            <div className="font-bold">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="text-xs">
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-8 gap-1">
        {timeSlots.map((hour) => (
          <React.Fragment key={hour}>
            {/* Time label */}
            <div className="p-2 text-xs text-muted-foreground border-r border-border">
              {formatTime(hour)}
            </div>
            
            {/* Day columns */}
            {weekData.map((date) => {
              const dayEvents = getEventsForDate(date);
              const hourEvents = dayEvents.filter(event => {
                if (!event.time) return false;
                const eventHour = parseInt(event.time.split(':')[0]);
                return eventHour === hour;
              });

              return (
                <div
                  key={`${date.toISOString()}-${hour}`}
                  className="min-h-[60px] p-1 border border-border relative"
                >
                  {hourEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className={`absolute left-1 right-1 p-1 text-xs rounded text-white truncate ${
                        event.color || 'bg-calendar-event'
                      }`}
                      style={{
                        top: `${index * 20}px`,
                        zIndex: index + 1
                      }}
                      title={`${event.title} - ${event.time}`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

WeekView.displayName = "WeekView";

export { WeekView };
