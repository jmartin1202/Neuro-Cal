import { useState, useCallback, useMemo } from "react";
import { CalendarHeader } from "@/components/CalendarHeader";
import { CalendarGrid } from "@/components/CalendarGrid";
import { AIPanel } from "@/components/AIPanel";
import { CreateEventModal } from "@/components/CreateEventModal";
import { Event } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, LogIn } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

const Index = () => {
  const { user, logout, isLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [events, setEvents] = useState<Event[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const isMobile = useIsMobile();

  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  const handleAuthModeSwitch = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
  };

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
            <div className="flex items-center gap-2">
              {!isLoading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Logout</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowAuthModal(true)}
                        className="flex items-center gap-2"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Button>
                    </div>
                  )}
                </>
              )}
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

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {authMode === "login" ? "Sign In" : "Create Account"}
            </h2>
            
            {authMode === "login" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your password"
                  />
                </div>
                <Button className="w-full">
                  Sign In
                </Button>
                <p className="text-sm text-center">
                  Don't have an account?{" "}
                  <button
                    onClick={handleAuthModeSwitch}
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded-md"
                    placeholder="Create a password"
                  />
                </div>
                <Button className="w-full">
                  Create Account
                </Button>
                <p className="text-sm text-center">
                  Already have an account?{" "}
                  <button
                    onClick={handleAuthModeSwitch}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
            
            <Button
              variant="ghost"
              onClick={() => setShowAuthModal(false)}
              className="mt-4 w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
