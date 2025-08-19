import React, { useState, useCallback, Suspense, lazy, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Event } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, Calendar, Sparkles, Zap, Users, Clock, X, BarChart3, Crown, Star, Lock } from "lucide-react";

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

// Demo mode feature gating component
const FeatureGate = ({ 
  children, 
  feature, 
  plan, 
  onUpgrade 
}: { 
  children: React.ReactNode; 
  feature: string; 
  plan: "basic" | "pro"; 
  onUpgrade: () => void;
}) => {
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg shadow-lg text-center max-w-sm">
          <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Premium Feature</h3>
          <p className="text-sm text-gray-600 mb-3">
            {feature} requires {plan === "basic" ? "Basic" : "Pro"} plan
          </p>
          <Button onClick={onUpgrade} size="sm" className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to {plan === "basic" ? "Basic" : "Pro"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Pricing modal component
const PricingModal = ({ 
  isOpen, 
  onClose, 
  onSelectPlan 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelectPlan: (plan: "trial" | "basic" | "pro") => void;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

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
        className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
          <p className="text-gray-600">Start with a free trial, then choose the plan that fits your needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Trial */}
          <div className="border rounded-lg p-6 text-center">
            <div className="mb-4">
              <Star className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">Free Trial</h3>
              <p className="text-gray-600 text-sm">7 days full access</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600">/7 days</span>
            </div>
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Full calendar access
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Basic event creation
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                AI suggestions (limited)
              </li>
            </ul>
            <Button 
              onClick={() => onSelectPlan("trial")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Start Free Trial
            </Button>
          </div>

          {/* Basic Plan */}
          <div className="border-2 border-blue-500 rounded-lg p-6 text-center relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <div className="mb-4">
              <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">Basic</h3>
              <p className="text-gray-600 text-sm">Perfect for individuals</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">$4.99</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Everything in trial
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Unlimited events
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Advanced AI features
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Priority support
              </li>
            </ul>
            <Button 
              onClick={() => onSelectPlan("basic")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Choose Basic
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="border rounded-lg p-6 text-center">
            <div className="mb-4">
              <Crown className="h-12 w-12 text-purple-500 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">Pro</h3>
              <p className="text-gray-600 text-sm">For power users & teams</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">$9.99</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Everything in Basic
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Team collaboration
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Advanced analytics
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                API access
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                White-label options
              </li>
            </ul>
            <Button 
              onClick={() => onSelectPlan("pro")}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Choose Pro
            </Button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

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

// Error boundary component
const ErrorBoundary = ({ 
  children, 
  fallback, 
  componentName 
}: { 
  children: React.ReactNode; 
  fallback: React.ReactNode; 
  componentName: string;
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error(`🚨 Error in ${componentName}:`, error);
    return <>{fallback}</>;
  }
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
    const [showPricingModal, setShowPricingModal] = useState(false);
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
      if (!user) {
        // Show upgrade prompt for demo users
        setShowPricingModal(true);
        return;
      }
      setSelectedDate(date);
      setIsCreateModalOpen(true);
    }, [user]);

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
      if (!user) {
        // Show upgrade prompt for demo users
        setShowPricingModal(true);
        return;
      }

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
    }, [parseNaturalLanguageEvent, getEventColor, toast, user]);

    const handleSelectPlan = useCallback((plan: "trial" | "basic" | "pro") => {
      setShowPricingModal(false);
      
      if (plan === "trial") {
        // Show signup modal for trial
        setAuthMode("register");
        setShowAuthModal(true);
        toast({
          title: "Start Your Free Trial! 🎉",
          description: "Create an account to get 7 days of full access to NeuroCal!",
        });
      } else {
        // Show signup modal for paid plans
        setAuthMode("register");
        setShowAuthModal(true);
        toast({
          title: `Upgrade to ${plan === "basic" ? "Basic" : "Pro"}! 🚀`,
          description: `Create an account to access the ${plan === "basic" ? "$4.99" : "$9.99"} plan!`,
        });
      }
    }, [toast]);

    console.log("✅ About to render demo calendar interface..."); // Debug log

    // Always show the calendar interface (demo mode)
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">NeuroCal</span>
              {!user && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Demo Mode
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  <a 
                    href="https://neurocal-analytics-f798adc616ee.herokuapp.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground border-primary/20 hover:border-primary/40"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Live Dashboard
                    </Button>
                  </a>
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
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPricingModal(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAuthModal(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Demo Banner for non-authenticated users */}
        {!user && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3">
            <div className="container mx-auto text-center">
              <p className="text-sm">
                🎉 <strong>Demo Mode:</strong> Test all features! 
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="ml-3 bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => setShowPricingModal(true)}
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Upgrade to Save Events
                </Button>
                <a 
                  href="https://neurocal-analytics-f798adc616ee.herokuapp.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-3"
                >
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    View Analytics
                  </Button>
                </a>
              </p>
            </div>
          </div>
        )}

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
              {!user ? (
                <ErrorBoundary 
                  componentName="FeatureGate" 
                  fallback={
                    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                      <p className="text-yellow-800">AI Panel temporarily unavailable</p>
                      <Button 
                        onClick={() => setShowPricingModal(true)}
                        className="mt-2"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade Now
                      </Button>
                    </div>
                  }
                >
                  <FeatureGate 
                    feature="AI Event Creation" 
                    plan="basic"
                    onUpgrade={() => setShowPricingModal(true)}
                  >
                    <Suspense fallback={<AIPanelFallback />}>
                      <AIPanel 
                        upcomingEvents={events}
                        onCreateEvent={handleAICreateEvent} 
                      />
                    </Suspense>
                  </FeatureGate>
                </ErrorBoundary>
              ) : (
                <Suspense fallback={<AIPanelFallback />}>
                  <AIPanel 
                    upcomingEvents={events}
                    onCreateEvent={handleAICreateEvent} 
                  />
                </Suspense>
              )}
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

        {/* Pricing Modal */}
        <ErrorBoundary 
          componentName="PricingModal" 
          fallback={
            showPricingModal ? (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-md text-center">
                  <h3 className="text-xl font-semibold mb-4">Pricing Temporarily Unavailable</h3>
                  <p className="text-gray-600 mb-4">Please try again later or contact support.</p>
                  <Button onClick={() => setShowPricingModal(false)}>Close</Button>
                </div>
              </div>
            ) : null
          }
        >
          <PricingModal
            isOpen={showPricingModal}
            onClose={() => setShowPricingModal(false)}
            onSelectPlan={handleSelectPlan}
          />
        </ErrorBoundary>
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
