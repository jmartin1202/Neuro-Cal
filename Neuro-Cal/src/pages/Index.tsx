import React, { useState, useCallback, Suspense, lazy, useRef, useEffect } from "react";
import { Event } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, Calendar, Sparkles, Zap, Users, Clock, X } from "lucide-react";

// Lazy load components to isolate issues
const CalendarHeader = lazy(() => import("@/components/CalendarHeader").then(module => ({ default: module.CalendarHeader })));
const CalendarGrid = lazy(() => import("@/components/CalendarGrid").then(module => ({ default: module.CalendarGrid })));
const AIPanel = lazy(() => import("@/components/AIPanel").then(module => ({ default: module.AIPanel })));
const CreateEventModal = lazy(() => import("@/components/CreateEventModal").then(module => ({ default: module.CreateEventModal })));
const LoginForm = lazy(() => import("@/components/auth/LoginForm").then(module => ({ default: module.LoginForm })));
const RegisterForm = lazy(() => import("@/components/auth/RegisterForm").then(module => ({ default: module.RegisterForm })));

// Loading fallbacks for each component
const CalendarHeaderFallback = () => (
  <div className="p-4 bg-gradient-card border-b border-border rounded-lg mb-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-primary rounded-lg animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-6 w-32 bg-gradient-primary rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
        <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

const CalendarGridFallback = () => (
  <div className="grid grid-cols-7 gap-2 p-4">
    {Array.from({ length: 35 }).map((_, i) => (
      <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
    ))}
  </div>
);

const AIPanelFallback = () => (
  <div className="p-4 bg-card border rounded-lg">
    <div className="space-y-3">
      <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
      <div className="h-10 bg-muted rounded animate-pulse"></div>
      <div className="h-20 bg-muted rounded animate-pulse"></div>
    </div>
  </div>
);

// Modal component with click-outside-to-close functionality
const AuthModal = ({ 
  isOpen, 
  onClose, 
  authMode, 
  onAuthModeSwitch 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  authMode: "login" | "register"; 
  onAuthModeSwitch: () => void;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-md relative"
      >
        {/* Close button - top right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
        </button>

        <div className="flex justify-between items-center mb-6 pr-8">
          <h3 className="text-xl font-semibold">
            {authMode === "login" ? "Sign In" : "Create Account"}
          </h3>
        </div>
        
        <Suspense fallback={<div className="p-4 text-center">Loading form...</div>}>
          {authMode === "login" ? (
            <LoginForm />
          ) : (
            <RegisterForm />
          )}
        </Suspense>
        
        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={onAuthModeSwitch}
            className="text-blue-600 hover:text-blue-700"
          >
            {authMode === "login" 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  console.log("🚀 Index component rendering..."); // Debug log
  
  try {
    console.log("✅ About to call React hooks..."); // Debug log
    
    // All React hooks MUST be at the top level
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
    
    console.log("✅ React hooks called successfully"); // Debug log

    const handleLogout = useCallback(() => {
      logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    }, [logout, toast]);

    const handleAuthModeSwitch = useCallback(() => {
      setAuthMode(authMode === "login" ? "register" : "login");
    }, [authMode]);

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

    const getEventColor = useCallback((type: Event['type']) => {
      switch (type) {
        case "meeting":
          return "bg-calendar-event";
        case "focus":
          return "bg-primary";
        case "break":
          return "bg-accent";
        case "travel":
          return "bg-secondary";
        default:
          return "bg-muted";
      }
    }, []);

    const parseNaturalLanguageEvent = useCallback((text: string) => {
      // Enhanced AI parsing logic
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Simple but effective parsing
      const lowerText = text.toLowerCase();
      let date = now;
      let time = "9:00 AM";
      let duration = "60";
      let type: Event['type'] = "meeting";
      
      if (lowerText.includes("tomorrow")) {
        date = tomorrow;
      } else if (lowerText.includes("next week")) {
        date = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
      
      if (lowerText.includes("morning")) time = "9:00 AM";
      else if (lowerText.includes("afternoon")) time = "2:00 PM";
      else if (lowerText.includes("evening")) time = "6:00 PM";
      
      if (lowerText.includes("quick") || lowerText.includes("short")) duration = "30";
      else if (lowerText.includes("long") || lowerText.includes("extended")) duration = "120";
      
      if (lowerText.includes("focus") || lowerText.includes("work")) type = "focus";
      else if (lowerText.includes("break") || lowerText.includes("rest")) type = "break";
      else if (lowerText.includes("travel")) type = "travel";
      
      return {
        title: text,
        date: date,
        time,
        duration,
        location: "",
        attendees: [],
        type,
        formattedDate: date.toLocaleDateString()
      };
    }, []);

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
    }, [parseNaturalLanguageEvent, getEventColor, toast]);

    console.log("✅ About to render landing page or main interface..."); // Debug log

    // Landing page content for non-authenticated users
    if (!user && !isLoading) {
      console.log("Rendering landing page..."); // Debug log
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
              <div className="text-center">
                <div className="flex justify-center mb-8">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                    <Calendar className="h-12 w-12 text-white" />
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">NeuroCal</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  The AI-powered calendar that understands natural language and helps you schedule smarter, not harder.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Button 
                    onClick={() => {
                      setAuthMode("register");
                      setShowAuthModal(true);
                    }}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      setAuthMode("login");
                      setShowAuthModal(true);
                    }}
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 text-lg border-2"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Why Choose NeuroCal?
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Experience the future of calendar management with cutting-edge AI technology
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Scheduling</h3>
                  <p className="text-gray-600">Just describe your event in plain English and let AI handle the details</p>
                </div>
                
                <div className="text-center p-6">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Optimization</h3>
                  <p className="text-gray-600">AI suggests optimal times and helps avoid scheduling conflicts</p>
                </div>
                
                <div className="text-center p-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
                  <p className="text-gray-600">Easily coordinate with team members and share calendars</p>
                </div>
                
                <div className="text-center p-6">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Time Management</h3>
                  <p className="text-gray-600">Track your productivity and optimize your daily schedule</p>
                </div>
                
                <div className="text-center p-6">
                  <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Platform Sync</h3>
                  <p className="text-gray-600">Access your calendar from anywhere, on any device</p>
                </div>
                
                <div className="text-center p-6">
                  <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Intelligent Insights</h3>
                  <p className="text-gray-600">Get analytics and suggestions to improve your scheduling habits</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Calendar?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of users who are already scheduling smarter with NeuroCal
              </p>
              <Button 
                onClick={() => {
                  setAuthMode("register");
                  setShowAuthModal(true);
                }}
                size="lg"
                variant="secondary"
                className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-100"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Your Free Trial
              </Button>
            </div>
          </div>

          {/* Auth Modal */}
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            authMode={authMode}
            onAuthModeSwitch={handleAuthModeSwitch}
          />
        </div>
      );
    }

    console.log("Rendering main calendar interface..."); // Debug log

    // Main calendar interface for authenticated users
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">NeuroCal</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <Suspense fallback={<CalendarHeaderFallback />}>
                <CalendarHeader
                  currentDate={currentDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  view={view}
                  onViewChange={setView}
                />
              </Suspense>
              
              <Suspense fallback={<CalendarGridFallback />}>
                <CalendarGrid
                  currentDate={currentDate}
                  events={events}
                  selectedDate={selectedDate}
                  onDateClick={handleDateClick}
                />
              </Suspense>
            </div>

            {/* AI Panel */}
            <div className="space-y-4">
              <Suspense fallback={<AIPanelFallback />}>
                <AIPanel 
                  upcomingEvents={events}
                  onCreateEvent={handleAICreateEvent} 
                />
              </Suspense>
            </div>
          </div>
        </main>

        {/* Create Event Modal */}
        <Suspense fallback={<div>Loading modal...</div>}>
          <CreateEventModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreateEvent={handleCreateEvent}
            selectedDate={selectedDate}
          />
        </Suspense>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          authMode={authMode}
          onAuthModeSwitch={handleAuthModeSwitch}
        />
      </div>
    );
  } catch (error) {
    console.error("🚨 ERROR in Index component:", error);
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">🚨 ERROR!</h1>
          <p className="text-xl mb-4">Something went wrong:</p>
          <pre className="bg-red-600 p-4 rounded text-sm">
            {error instanceof Error ? error.message : String(error)}
          </pre>
          <div className="mt-4">
            <p>This will help us identify which component is causing the issue.</p>
            <p>Check the browser console for more details.</p>
          </div>
        </div>
      </div>
    );
  }
};

export default Index;
