import { Event, EventCard } from "./EventCard";
import { useMemo, useCallback, memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarGridProps {
  currentDate: Date;
  events: Event[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}

// Memoized calendar day component to prevent unnecessary re-renders
const CalendarDay = memo(({ 
  dayInfo, 
  isToday, 
  isSelected, 
  dayEvents, 
  onDateClick, 
  isMobile 
}: {
  dayInfo: { day: number; isCurrentMonth: boolean; date: Date };
  isToday: boolean;
  isSelected: boolean;
  dayEvents: Event[];
  onDateClick: (date: Date) => void;
  isMobile: boolean;
}) => {
  const handleClick = useCallback(() => {
    onDateClick(dayInfo.date);
  }, [dayInfo.date, onDateClick]);

  return (
    <div
      className={`
        ${isMobile ? 'min-h-[80px]' : 'min-h-[120px]'} p-1 md:p-2 border border-border rounded-lg cursor-pointer
        transition-all duration-200 hover:shadow-md hover:border-primary/50
        ${!dayInfo.isCurrentMonth ? 'opacity-40' : ''}
        ${isToday ? 'bg-gradient-ai ring-1 ring-calendar-today/20' : 'bg-card'}
        ${isSelected ? 'ring-2 ring-calendar-selected' : ''}
      `}
      onClick={handleClick}
      title={`Click to create event on ${dayInfo.date.toLocaleDateString()}`}
    >
      <div className="flex items-center justify-between mb-1 md:mb-2">
        <span
          className={`
            text-xs md:text-sm font-medium
            ${!dayInfo.isCurrentMonth ? 'text-muted-foreground' : 'text-foreground'}
            ${isToday ? 'text-calendar-today font-bold' : ''}
          `}
        >
          {dayInfo.day}
        </span>
        {isToday && (
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-calendar-today rounded-full" />
        )}
      </div>

      <div className="space-y-0.5 md:space-y-1">
        {dayEvents.slice(0, isMobile ? 1 : 2).map((event) => (
          <EventCard
            key={event.id}
            event={event}
            className={`text-xs p-0.5 md:p-1 ${isMobile ? 'text-[10px]' : ''}`}
          />
        ))}
        {dayEvents.length > (isMobile ? 1 : 2) && (
          <div className="text-xs text-muted-foreground px-1">
            +{dayEvents.length - (isMobile ? 1 : 2)} more
          </div>
        )}
        {dayEvents.length === 0 && dayInfo.isCurrentMonth && (
          <div className="text-xs text-muted-foreground/50 px-1 py-1 md:py-2 text-center">
            {isMobile ? '+' : 'Click to add event'}
          </div>
        )}
      </div>
    </div>
  );
});

CalendarDay.displayName = 'CalendarDay';

export const CalendarGrid = memo(({ 
  currentDate, 
  events, 
  selectedDate, 
  onDateClick 
}: CalendarGridProps) => {
  const today = new Date();
  const isMobile = useIsMobile();

  // Memoize expensive calculations
  const calendarData = useMemo(() => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

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

    return { calendarDays, firstDayOfWeek, daysInMonth };
  }, [currentDate]);

  // Memoize event-to-date mapping
  const eventDateMapping = useMemo(() => {
    const mapping = new Map<string, Event[]>();
    
    events.forEach((event) => {
      if (event.date && event.date instanceof Date && !isNaN(event.date.getTime())) {
        const key = `${event.date.getFullYear()}-${event.date.getMonth()}-${event.date.getDate()}`;
        if (!mapping.has(key)) {
          mapping.set(key, []);
        }
        mapping.get(key)!.push(event);
      }
    });
    
    return mapping;
  }, [events]);

  // Memoize weekdays array
  const weekDays = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);

  // Memoize utility functions
  const isToday = useCallback((date: Date) => {
    return date.toDateString() === today.toDateString();
  }, [today]);

  const isSelected = useCallback((date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  }, [selectedDate]);

  const getEventsForDate = useCallback((date: Date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventDateMapping.get(key) || [];
  }, [eventDateMapping]);

  return (
    <div className="flex-1 p-3 md:p-6">
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 md:p-3 text-center text-xs md:text-sm font-medium text-muted-foreground"
          >
            {isMobile ? day.charAt(0) : day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarData.calendarDays.map((dayInfo) => {
          const dayEvents = getEventsForDate(dayInfo.date);
          const isTodayDay = isToday(dayInfo.date);
          const isSelectedDay = isSelected(dayInfo.date);

          return (
            <CalendarDay
              key={`${dayInfo.date.getFullYear()}-${dayInfo.date.getMonth()}-${dayInfo.date.getDate()}`}
              dayInfo={dayInfo}
              isToday={isTodayDay}
              isSelected={isSelectedDay}
              dayEvents={dayEvents}
              onDateClick={onDateClick}
              isMobile={isMobile}
            />
          );
        })}
      </div>
    </div>
  );
});

CalendarGrid.displayName = 'CalendarGrid';