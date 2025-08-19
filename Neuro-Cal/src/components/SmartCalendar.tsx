import { useState, useCallback } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { AIPanel } from "./AIPanel";
import { CreateEventModal } from "./CreateEventModal";
import { Event } from "./EventCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export const SmartCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [events, setEvents] = useState<Event[]>([]);
  const isMobile = useIsMobile();

  const { toast } = useToast();

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setIsCreateModalOpen(true);
  }, []);

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

  // Helper function to parse natural language into event details
  const parseNaturalLanguageEvent = (text: string) => {
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
  };

  const getEventColor = (type: Event['type']) => {
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
  };

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setSelectedDate(null);
  }, []);

  const todaysEvents = events.filter(event => {
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
        onViewChange={setView}
      />
      
      <div className={`flex flex-1 overflow-auto ${isMobile ? 'flex-col' : 'flex-row'}`}>
        <CalendarGrid
          currentDate={currentDate}
          events={events}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
        />
        
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