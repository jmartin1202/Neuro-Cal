import React, { memo, useMemo } from "react";
import { Event } from "./EventCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface DayViewProps {
  currentDate: Date;
  events: Event[];
  onDateClick: (date: Date) => void;
}

const DayView = memo(({ currentDate, events, onDateClick }: DayViewProps) => {
  const isMobile = useIsMobile();

  // Get events for the current date
  const dayEvents = useMemo(() => {
    return events.filter(event => {
      if (!event.date) return false;
      return event.date.toDateString() === currentDate.toDateString();
    }).sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return a.time.localeCompare(b.time);
    });
  }, [events, currentDate]);

  // Time slots for the day
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(hour);
    }
    return slots;
  }, []);

  const formatTime = (hour: number) => {
    if (hour === 12) return '12:00 PM';
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter(event => {
      if (!event.time) return false;
      const eventHour = parseInt(event.time.split(':')[0]);
      return eventHour === hour;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex-1 p-3 md:p-6 overflow-auto">
      {/* Day header */}
      <div className="mb-6 text-center">
        <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${
          isToday(currentDate) ? 'text-calendar-today' : 'text-foreground'
        }`}>
          {formatDate(currentDate)}
        </h2>
        {isToday(currentDate) && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-ai text-white rounded-full text-sm">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Today
          </div>
        )}
      </div>

      {/* Time grid */}
      <div className="space-y-1">
        {timeSlots.map((hour) => {
          const hourEvents = getEventsForHour(hour);
          
          return (
            <div key={hour} className="flex min-h-[80px] border-b border-border">
              {/* Time label */}
              <div className="w-20 md:w-24 p-2 text-sm text-muted-foreground border-r border-border flex-shrink-0">
                {formatTime(hour)}
              </div>
              
              {/* Events for this hour */}
              <div className="flex-1 p-2 relative">
                {hourEvents.length === 0 ? (
                  <div className="text-muted-foreground text-sm italic">
                    No events scheduled
                  </div>
                ) : (
                  <div className="space-y-2">
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg text-white shadow-sm ${
                          event.color || 'bg-calendar-event'
                        }`}
                      >
                        <div className="font-semibold text-sm md:text-base">
                          {event.title}
                        </div>
                        {event.time && (
                          <div className="text-xs opacity-90">
                            {event.time}
                            {event.duration && ` • ${event.duration}`}
                          </div>
                        )}
                        {event.location && (
                          <div className="text-xs opacity-90 mt-1">
                            📍 {event.location}
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="text-xs opacity-90 mt-1">
                            👥 {event.attendees.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Clickable area to add new event */}
                <div
                  className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-10 hover:bg-primary/20 transition-opacity"
                  onClick={() => onDateClick(currentDate)}
                  title="Click to add event"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add event button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => onDateClick(currentDate)}
          className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
        >
          + Add Event to {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </button>
      </div>
    </div>
  );
});

DayView.displayName = "DayView";

export { DayView };
