import { Event, EventCard } from "./EventCard";
import { useMemo } from "react";

interface CalendarGridProps {
  currentDate: Date;
  events: Event[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}

export const CalendarGrid = ({ 
  currentDate, 
  events, 
  selectedDate, 
  onDateClick 
}: CalendarGridProps) => {
  const today = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Create a stable event-to-date mapping using useMemo
  const eventDateMapping = useMemo(() => {
    const mapping = new Map<string, Event[]>();
    
    // Associate events with their actual dates
    events.forEach((event) => {
      if (event.date) {
        // Use the event's actual date
        const key = `${event.date.getFullYear()}-${event.date.getMonth()}-${event.date.getDate()}`;
        if (!mapping.has(key)) {
          mapping.set(key, []);
        }
        mapping.get(key)!.push(event);
      } else {
        // Fallback to the old random assignment for events without dates
        const hash = event.id.charCodeAt(0);
        const dayOfMonth = (hash % daysInMonth) + 1;
        const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${dayOfMonth}`;
        
        if (!mapping.has(key)) {
          mapping.set(key, []);
        }
        mapping.get(key)!.push(event);
      }
    });
    
    return mapping;
  }, [events, currentDate, daysInMonth]);

  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const day = prevMonth.getDate() - firstDayOfWeek + i + 1;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day)
    });
  }

  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    });
  }

  // Add days from next month to fill the grid
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: nextMonth
    });
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventDateMapping.get(key) || [];
  };

  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => {
          const dayEvents = getEventsForDate(dayInfo.date);
          const isCurrentMonthDay = dayInfo.isCurrentMonth;
          const isTodayDay = isToday(dayInfo.date);
          const isSelectedDay = isSelected(dayInfo.date);

          return (
            <div
              key={index}
              className={`
                min-h-[120px] p-2 border border-border rounded-lg cursor-pointer
                transition-all duration-200 hover:shadow-md hover:border-primary/50
                ${!isCurrentMonthDay ? 'opacity-40' : ''}
                ${isTodayDay ? 'bg-gradient-ai ring-1 ring-calendar-today/20' : 'bg-card'}
                ${isSelectedDay ? 'ring-2 ring-calendar-selected' : ''}
              `}
              onClick={() => onDateClick(dayInfo.date)}
              title={`Click to create event on ${dayInfo.date.toLocaleDateString()}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`
                    text-sm font-medium
                    ${!isCurrentMonthDay ? 'text-muted-foreground' : 'text-foreground'}
                    ${isTodayDay ? 'text-calendar-today font-bold' : ''}
                  `}
                >
                  {dayInfo.day}
                </span>
                {isTodayDay && (
                  <div className="w-2 h-2 bg-calendar-today rounded-full" />
                )}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event, eventIndex) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    className="text-xs p-1"
                  />
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayEvents.length - 2} more
                  </div>
                )}
                {dayEvents.length === 0 && isCurrentMonthDay && (
                  <div className="text-xs text-muted-foreground/50 px-1 py-2 text-center">
                    Click to add event
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};