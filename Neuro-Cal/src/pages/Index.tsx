import { useState, useCallback, useMemo } from "react";
import { CalendarHeader } from "@/components/CalendarHeader";
import { CalendarGrid } from "@/components/CalendarGrid";
import { AIPanel } from "@/components/AIPanel";
import { CreateEventModal } from "@/components/CreateEventModal";
import { Event } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
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

  const parseNaturalLanguageEvent = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    
    let eventDate = new Date();
    let time = "9:00 AM";
    let duration = "1 hour";
    let type: Event['type'] = "meeting";
    let location = "";
    let attendees: string[] = [];
    
    // Simple parsing logic
    if (lowerText.includes("tomorrow")) {
      eventDate.setDate(eventDate.getDate() + 1);
    }
    if (lowerText.includes("next week")) {
      eventDate.setDate(eventDate.getDate() + 7);
    }
    
    if (lowerText.includes("meeting")) type = "meeting";
    if (lowerText.includes("focus")) type = "focus";
    if (lowerText.includes("break")) type = "break";
    if (lowerText.includes("travel")) type = "travel";
    
    const title = text.split(" ").slice(0, 3).join(" ") + "...";
    
    return {
      title,
      date: eventDate,
      time,
      duration,
      type,
      location,
      attendees,
      formattedDate: eventDate.toLocaleDateString()
    };
  }, []);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(event => event.date && new Date(event.date) > new Date())
      .sort((a, b) => a.date && b.date ? new Date(a.date).getTime() - new Date(b.date).getTime() : 0)
      .slice(0, 5);
  }, [events]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">NeuroCal</h1>
              <span className="text-base text-muted-foreground">Smart AI Calendar</span>
            </div>
            <div className="text-sm text-muted-foreground">
              AI-Powered Calendar Working! 🚀
            </div>
          </div>
        </div>
      </div>
      
      {/* Smart Calendar Components */}
      <div className="space-y-6 p-6">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          view={view}
          onViewChange={setView}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <CalendarGrid
              currentDate={currentDate}
              events={events}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
            />
          </div>
          
          <div className="space-y-6">
            <AIPanel
              upcomingEvents={upcomingEvents}
              onCreateEvent={handleAICreateEvent}
            />
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {selectedDate && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedDate(null);
          }}
          selectedDate={selectedDate}
          onCreateEvent={handleCreateEvent}
        />
      )}
    </div>
  );
};

export default Index;
