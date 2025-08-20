import { useState, useCallback, useMemo } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { AIPanel } from "./AIPanel";
import { CreateEventModal } from "./CreateEventModal";
import { Event } from "./EventCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * SmartCalendar Component
 * 
 * A comprehensive calendar component that provides intelligent event management,
 * multiple view modes, AI-powered suggestions, and responsive design for both
 * desktop and mobile devices.
 * 
 * @component
 * @description
 * The SmartCalendar component serves as the main calendar interface for the Neuro-Cal
 * application. It integrates calendar views, event management, AI suggestions,
 * and responsive design to provide a seamless user experience.
 * 
 * @features
 * - Multiple view modes: Month, Week, and Day views
 * - AI-powered event creation and suggestions
 * - Responsive design for mobile and desktop
 * - Event creation and management
 * - Date navigation and selection
 * - Toast notifications for user feedback
 * 
 * @state
 * - currentDate: Currently displayed date
 * - selectedDate: Date selected by user for event creation
 * - isCreateModalOpen: Modal visibility state
 * - view: Current calendar view mode
 * - events: Array of calendar events
 * 
 * @hooks
 * - useToast: For displaying user notifications
 * - useIsMobile: For responsive behavior
 * 
 * @example
 * ```tsx
 * <SmartCalendar />
 * ```
 * 
 * @returns {JSX.Element} The SmartCalendar component
 */
export const SmartCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [events, setEvents] = useState<Event[]>([]);
  const isMobile = useIsMobile();

  const { toast } = useToast();

  /**
   * Navigate to the previous period based on current view
   * 
   * @description
   * Handles navigation to the previous time period. The navigation behavior
   * depends on the current view mode:
   * - Month view: Goes to previous month
   * - Week view: Goes to previous week
   * - Day view: Goes to previous day
   * 
   * @example
   * ```tsx
   * <button onClick={handlePrevMonth}>Previous</button>
   * ```
   */
  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === "month") {
        newDate.setMonth(prev.getMonth() - 1);
      } else if (view === "week") {
        newDate.setDate(prev.getDate() - 7);
      } else if (view === "day") {
        newDate.setDate(prev.getDate() - 1);
      }
      return newDate;
    });
  }, [view]);

  /**
   * Navigate to the next period based on current view
   * 
   * @description
   * Handles navigation to the next time period. The navigation behavior
   * depends on the current view mode:
   * - Month view: Goes to next month
   * - Week view: Goes to next week
   * - Day view: Goes to next day
   * 
   * @example
   * ```tsx
   * <button onClick={handleNextMonth}>Next</button>
   * ```
   */
  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === "month") {
        newDate.setMonth(prev.getMonth() + 1);
      } else if (view === "week") {
        newDate.setDate(prev.getDate() + 7);
      } else if (view === "day") {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  }, [view]);

  /**
   * Handle date selection for event creation
   * 
   * @description
   * When a user clicks on a date in the calendar, this function:
   * 1. Sets the selected date for event creation
   * 2. Opens the event creation modal
   * 
   * @param {Date} date - The date that was clicked
   * 
   * @example
   * ```tsx
   * <CalendarCell onClick={() => handleDateClick(date)} />
   * ```
   */
  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setIsCreateModalOpen(true);
  }, []);

  /**
   * Handle calendar view mode changes
   * 
   * @description
   * Changes the calendar view mode and adjusts the current date accordingly:
   * - Day view: Sets to today's date
   * - Week view: Adjusts to start of current week
   * - Month view: Adjusts to start of current month
   * 
   * @param {"month" | "week" | "day"} newView - The new view mode to switch to
   * 
   * @example
   * ```tsx
   * <button onClick={() => handleViewChange('week')}>Week View</button>
   * ```
   */
  const handleViewChange = useCallback((newView: "month" | "week" | "day") => {
    setView(newView);
    
    // Adjust current date based on view
    if (newView === "day") {
      // For day view, set to today if not already on a specific day
      const today = new Date();
      if (currentDate.toDateString() !== today.toDateString()) {
        setCurrentDate(today);
      }
    } else if (newView === "week") {
      // For week view, ensure we're at the start of a week
      const newDate = new Date(currentDate);
      const day = newDate.getDay();
      const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
      newDate.setDate(diff);
      setCurrentDate(newDate);
    } else if (newView === "month") {
      // For month view, ensure we're at the start of a month
      const newDate = new Date(currentDate);
      newDate.setDate(1);
      setCurrentDate(newDate);
    }
  }, [currentDate]);

  /**
   * Create a new calendar event
   * 
   * @description
   * Creates a new event with a unique ID and adds it to the events array.
   * Displays a success toast notification to confirm event creation.
   * 
   * @param {Omit<Event, 'id'>} eventData - Event data without ID (ID is generated automatically)
   * @returns {Promise<void>} Promise that resolves when event is created
   * 
   * @example
   * ```tsx
   * const eventData = {
   *   title: "Team Meeting",
   *   start: new Date(),
   *   end: new Date(Date.now() + 3600000),
   *   // ... other event properties
   * };
   * await handleCreateEvent(eventData);
   * ```
   */
  const handleCreateEvent = useCallback(async (eventData: Omit<Event, 'id'>) => {
    // Create new event with unique ID
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    setEvents(prev => [...prev, newEvent]);
    
    toast({
      title: "Event Created! 🎉",
      description: `"${newEvent.title}" has been added to your calendar.`,
    });

    return Promise.resolve();
  }, [toast]);

  const handleAICreateEvent = useCallback((eventText: string) => {
    // Parse natural language to extract event details
    const parsedEvent = parseNaturalLanguageEvent(eventText);
    
    const aiGeneratedEvent: Event = {
      id: `ai-${Date.now()}`,
      title: parsedEvent.title,
      time: parsedEvent.time,
      duration: parsedEvent.duration,
      date: parsedEvent.date,
      location: parsedEvent.location,
      attendees: parsedEvent.attendees,
      color: getEventColor(parsedEvent.type),
      type: parsedEvent.type,
      isAiSuggested: true
    };

    setEvents(prev => [...prev, aiGeneratedEvent]);
    
    toast({
      title: "Event Created",
      description: `AI has scheduled "${parsedEvent.title}" on ${parsedEvent.formattedDate} at ${parsedEvent.time}`,
    });
  }, [toast]);

  // Memoize the getEventColor function
  const getEventColor = useCallback((type: Event['type']) => {
    switch (type) {
      case "meeting":
        return "bg-calendar-event";
      case "focus":
        return "bg-primary";
      case "break":
        return "bg-accent";
      case "travel":
        return "bg-destructive";
      default:
        return "bg-calendar-event";
    }
  }, []);

  // Helper function to parse natural language into event details
  const parseNaturalLanguageEvent = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    
    // Extract date information
    let eventDate = new Date();
    let time = "9:00 AM";
    let duration = "1 hour";
    let type: Event['type'] = "meeting";
    let location = "";
    let attendees: string[] = [];
    
    // Parse date patterns
    if (lowerText.includes("august 30") || lowerText.includes("aug 30")) {
      eventDate = new Date(new Date().getFullYear(), 7, 30); // August is month 7 (0-indexed)
    } else if (lowerText.includes("august 31") || lowerText.includes("aug 31")) {
      eventDate = new Date(new Date().getFullYear(), 7, 31);
    } else if (lowerText.includes("september")) {
      eventDate = new Date(new Date().getFullYear(), 8, 1);
    } else if (lowerText.includes("october")) {
      eventDate = new Date(new Date().getFullYear(), 9, 1);
    } else if (lowerText.includes("tomorrow")) {
      eventDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else if (lowerText.includes("next week")) {
      eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    
    // Parse time patterns
    if (lowerText.includes("8am") || lowerText.includes("8 am") || lowerText.includes("8:00am")) {
      time = "8:00 AM";
    } else if (lowerText.includes("9am") || lowerText.includes("9 am") || lowerText.includes("9:00am")) {
      time = "9:00 AM";
    } else if (lowerText.includes("10am") || lowerText.includes("10 am") || lowerText.includes("10:00am")) {
      time = "10:00 AM";
    } else if (lowerText.includes("11am") || lowerText.includes("11 am") || lowerText.includes("11:00am")) {
      time = "11:00 AM";
    } else if (lowerText.includes("12pm") || lowerText.includes("12 pm") || lowerText.includes("noon")) {
      time = "12:00 PM";
    } else if (lowerText.includes("1pm") || lowerText.includes("1 pm") || lowerText.includes("1:00pm")) {
      time = "1:00 PM";
    } else if (lowerText.includes("2pm") || lowerText.includes("2 pm") || lowerText.includes("2:00pm")) {
      time = "2:00 PM";
    } else if (lowerText.includes("3pm") || lowerText.includes("3 pm") || lowerText.includes("3:00pm")) {
      time = "3:00 PM";
    } else if (lowerText.includes("4pm") || lowerText.includes("4 pm") || lowerText.includes("4:00pm")) {
      time = "4:00 PM";
    } else if (lowerText.includes("5pm") || lowerText.includes("5 pm") || lowerText.includes("5:00pm")) {
      time = "5:00 PM";
    } else if (lowerText.includes("6pm") || lowerText.includes("6 pm") || lowerText.includes("6:00pm")) {
      time = "6:00 PM";
    }
    
    // Parse duration patterns
    if (lowerText.includes("30 min") || lowerText.includes("30 minutes")) {
      duration = "30 min";
    } else if (lowerText.includes("1 hour") || lowerText.includes("1hr")) {
      duration = "1 hour";
    } else if (lowerText.includes("2 hours") || lowerText.includes("2hrs")) {
      duration = "2 hours";
    } else if (lowerText.includes("3 hours") || lowerText.includes("3hrs")) {
      duration = "3 hours";
    } else if (lowerText.includes("all day")) {
      duration = "All day";
    }
    
    // Parse event type
    if (lowerText.includes("meeting")) {
      type = "meeting";
    } else if (lowerText.includes("focus") || lowerText.includes("work")) {
      type = "focus";
    } else if (lowerText.includes("break") || lowerText.includes("lunch")) {
      type = "break";
    } else if (lowerText.includes("travel")) {
      type = "travel";
    }
    
    // Parse location
    if (lowerText.includes("office")) {
      location = "Office";
    } else if (lowerText.includes("conference room") || lowerText.includes("conf room")) {
      location = "Conference Room";
    } else if (lowerText.includes("zoom") || lowerText.includes("online")) {
      location = "Zoom/Online";
    }
    
    // Parse attendees
    if (lowerText.includes("team")) {
      attendees = ["Team Members"];
    } else if (lowerText.includes("john")) {
      attendees = ["John"];
    } else if (lowerText.includes("sarah")) {
      attendees = ["Sarah"];
    } else if (lowerText.includes("mike")) {
      attendees = ["Mike"];
    }
    
    // Generate title from input
    let title = text;
    if (title.length > 50) {
      title = title.substring(0, 50) + "...";
    }
    
    // Format date for display
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return {
      title,
      time,
      duration,
      type,
      location,
      attendees,
      date: eventDate,
      formattedDate
    };
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setSelectedDate(null);
  }, []);

  // Memoize today's events calculation
  const todaysEvents = useMemo(() => {
    return events.filter(event => {
      if (!event.date || !(event.date instanceof Date) || isNaN(event.date.getTime())) {
        console.warn('Event without valid date:', event);
        return false;
      }
      
      const today = new Date();
      const todayString = today.toDateString();
      const eventDateString = event.date.toDateString();
      
      // Show events for today and upcoming days
      return event.date >= today;
    });
  }, [events]);

  // Memoize layout class
  const layoutClass = useMemo(() => {
    return isMobile ? 'flex-col' : 'flex-row';
  }, [isMobile]);

  // Debug logging
  console.log('Current events:', events.map(e => ({ 
    id: e.id, 
    title: e.title, 
    date: e.date?.toDateString() 
  })));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        view={view}
        onViewChange={handleViewChange}
      />
      
      <div className={`flex flex-1 overflow-auto ${layoutClass}`}>
        {/* Calendar Views */}
        {view === "month" && (
          <CalendarGrid
            currentDate={currentDate}
            events={events}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
        )}
        
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            events={events}
            onDateClick={handleDateClick}
          />
        )}
        
        {view === "day" && (
          <DayView
            currentDate={currentDate}
            events={events}
            onDateClick={handleDateClick}
          />
        )}
        
        <AIPanel
          upcomingEvents={todaysEvents}
          onCreateEvent={handleAICreateEvent}
        />
      </div>

      {/* Create Event Modal */}
      {selectedDate && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          selectedDate={selectedDate}
          onCreateEvent={handleCreateEvent}
        />
      )}
    </div>
  );
};