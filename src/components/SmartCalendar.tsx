import { useState, useCallback } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { AIPanel } from "./AIPanel";
import { Event } from "./EventCard";
import { useToast } from "@/hooks/use-toast";

export const SmartCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Team Standup",
      time: "9:00 AM",
      duration: "30 min",
      location: "Conference Room A",
      attendees: ["John", "Sarah", "Mike"],
      color: "bg-calendar-event",
      type: "meeting"
    },
    {
      id: "2",
      title: "Focus Work - Project Review",
      time: "2:00 PM",
      duration: "2 hours",
      color: "bg-primary",
      type: "focus",
      isAiSuggested: true
    },
    {
      id: "3",
      title: "Coffee Break",
      time: "3:30 PM",
      duration: "15 min",
      color: "bg-accent",
      type: "break",
      isAiSuggested: true
    },
    {
      id: "4",
      title: "Client Meeting Prep",
      time: "4:00 PM",
      duration: "1 hour",
      location: "Office",
      color: "bg-destructive",
      type: "meeting"
    }
  ]);

  const { toast } = useToast();

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleCreateEvent = useCallback((eventText: string) => {
    // Simulate AI processing to create event
    const aiGeneratedEvent: Event = {
      id: `ai-${Date.now()}`,
      title: eventText.length > 30 ? eventText.substring(0, 30) + "..." : eventText,
      time: "10:00 AM", // AI would determine optimal time
      duration: "1 hour", // AI would estimate duration
      color: "bg-primary",
      type: "meeting",
      isAiSuggested: true
    };

    setEvents(prev => [...prev, aiGeneratedEvent]);
    
    toast({
      title: "Event Created",
      description: "AI has successfully scheduled your event at the optimal time.",
    });
  }, [toast]);

  const todaysEvents = events.filter(event => {
    const today = new Date();
    // For demo purposes, show all events as "today's events"
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        view={view}
        onViewChange={setView}
      />
      
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto">
          <CalendarGrid
            currentDate={currentDate}
            events={events}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
        </div>
        
        <div className="overflow-y-auto">
          <AIPanel
            upcomingEvents={todaysEvents}
            onCreateEvent={handleCreateEvent}
          />
        </div>
      </div>
    </div>
  );
};