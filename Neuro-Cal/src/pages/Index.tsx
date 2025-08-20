import React, { useState, useCallback, Suspense, lazy, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Event } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, Calendar, Sparkles, Zap, Users, Clock, X, BarChart3, Crown, Star, Lock, Plus, Check, Badge, Brain, AlertTriangle, RefreshCw, Code } from "lucide-react";
import { useErrorPrevention } from "@/hooks/useErrorPrevention";
import { ComponentSafetyWrapper } from "@/components/ComponentSafetyWrapper";

// Lazy load components to isolate issues
const InteractiveCalendar = lazy(() => import("@/components/InteractiveCalendar"));
const AIPanel = lazy(() => import("@/components/AIPanel").then(module => ({ default: module.AIPanel })));
const CreateEventModal = lazy(() => import("@/components/CreateEventModal").then(module => ({ default: module.CreateEventModal })));
const LoginForm = lazy(() => import("@/components/auth/LoginForm").then(module => ({ default: module.LoginForm })));
const RegisterForm = lazy(() => import("@/components/auth/RegisterForm").then(module => ({ default: module.RegisterForm })));



const AIPanelFallback = () => (
  <div className="p-4 bg-card rounded-lg border border-border">
    <div className="space-y-3">
      <div className="h-6 w-32 bg-primary/20 rounded animate-pulse"></div>
      <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
      <div className="h-10 bg-muted rounded animate-pulse"></div>
      <div className="h-20 bg-muted rounded animate-pulse"></div>
    </div>
  </div>
);

const Index = () => {
  console.log("🚀 Index component rendering..."); // Debug log
  
  // Error prevention hook
  const errorPrevention = useErrorPrevention("Index", {
    maxErrors: 3,
    errorWindowMs: 30000, // 30 seconds
    autoRecover: true,
    logErrors: true
  });
  
  // All React hooks MUST be at the top level
  const { user, logout, isLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [events, setEvents] = useState<Event[]>([
    // Sample events for demonstration
    {
      id: 'demo-1',
      title: 'Team Meeting',
      time: '09:00',
      duration: '1 hour',
      date: new Date(2025, 0, 15), // January 15, 2025
      location: 'Conference Room A',
      type: 'meeting',
      color: 'bg-blue-500'
    },
    {
      id: 'demo-2',
      title: 'Focus Time',
      time: '14:00',
      duration: '2 hours',
      date: new Date(2025, 0, 20), // January 20, 2025
      location: 'Home Office',
      type: 'focus',
      color: 'bg-green-500'
    },
    {
      id: 'demo-3',
      title: 'Lunch Break',
      time: '12:00',
      duration: '1 hour',
      date: new Date(2025, 0, 22), // January 22, 2025
      location: 'Cafeteria',
      type: 'break',
      color: 'bg-yellow-500'
    }
  ]);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  console.log("✅ React hooks called successfully"); // Debug log

  // Safe state setters
  const safeSetCurrentDate = useCallback((value: Date | ((prev: Date) => Date)) => {
    errorPrevention.safeSetState(setCurrentDate, value, 'setCurrentDate');
  }, [errorPrevention]);

  const safeSetSelectedDate = useCallback((value: Date | null | ((prev: Date | null) => Date | null)) => {
    errorPrevention.safeSetState(setSelectedDate, value, 'setSelectedDate');
  }, [errorPrevention]);

  const safeSetIsCreateModalOpen = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    errorPrevention.safeSetState(setIsCreateModalOpen, value, 'setIsCreateModalOpen');
  }, [errorPrevention]);

  const safeSetShowAuthModal = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    errorPrevention.safeSetState(setShowAuthModal, value, 'setShowAuthModal');
  }, [errorPrevention]);

  const safeSetShowPricingModal = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    errorPrevention.safeSetState(setShowPricingModal, value, 'setShowPricingModal');
  }, [errorPrevention]);

  const safeSetAuthMode = useCallback((value: 'login' | 'register' | ((prev: 'login' | 'register') => 'login' | 'register')) => {
    errorPrevention.safeSetState(setAuthMode, value, 'setAuthMode');
  }, [errorPrevention]);

  const safeSetEvents = useCallback((value: Event[] | ((prev: Event[]) => Event[])) => {
    errorPrevention.safeSetState(setEvents, value, 'setEvents');
  }, [errorPrevention]);

  // Event handlers with error prevention
  const handleDateClick = useCallback((date: Date) => {
    try {
      console.log('Date clicked:', date, 'User:', user, 'Dev mode:', isDeveloperMode); // Debug log
      
      if (!user && !isDeveloperMode) {
        console.log('Showing pricing modal - no user and no dev mode'); // Debug log
        safeSetShowPricingModal(true);
        return;
      }
      
      console.log('Opening create event modal for date:', date); // Debug log
      safeSetSelectedDate(date);
      safeSetIsCreateModalOpen(true);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleDateClick');
    }
  }, [user, isDeveloperMode, safeSetShowPricingModal, safeSetSelectedDate, safeSetIsCreateModalOpen, errorPrevention]);

  const handleCreateEvent = useCallback(async (eventData: Omit<Event, 'id'>) => {
    try {
      const newEvent: Event = {
        ...eventData,
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      console.log('Creating event in dev mode:', newEvent); // Debug log
      
      safeSetEvents(prev => {
        const updatedEvents = [...prev, newEvent];
        console.log('Updated events array:', updatedEvents); // Debug log
        return updatedEvents;
      });
      safeSetIsCreateModalOpen(false);
      
      toast({
        title: "Event Created! 🎉",
        description: `"${newEvent.title}" has been added to your calendar.`,
      });
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleCreateEvent');
      toast({
        title: "Error Creating Event",
        description: "Something went wrong. Please try again.",
      });
    }
  }, [toast, safeSetEvents, safeSetIsCreateModalOpen, errorPrevention]);

  const handleDeleteEvent = useCallback((eventId: string) => {
    try {
      safeSetEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Event Deleted",
        description: "Event has been removed from your calendar.",
      });
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleDeleteEvent');
      toast({
        title: "Error Deleting Event",
        description: "Something went wrong. Please try again.",
      });
    }
  }, [toast, safeSetEvents, errorPrevention]);

  const handleAICreateEvent = useCallback((eventText: string) => {
    try {
      if (!user && !isDeveloperMode) {
        safeSetShowPricingModal(true);
        return;
      }
      // AI event creation logic would go here
      if (isDeveloperMode) {
        toast({
          title: "AI Event Creation (Dev Mode)",
          description: `Creating event: "${eventText}" - This would normally require authentication.`,
        });
        return;
      }
      toast({
        title: "AI Event Creation",
        description: "This feature requires authentication.",
      });
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleAICreateEvent');
    }
  }, [user, isDeveloperMode, toast, safeSetShowPricingModal, errorPrevention]);

  const handleAuthModeSwitch = useCallback(() => {
    try {
      safeSetAuthMode(prev => prev === 'login' ? 'register' : 'login');
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleAuthModeSwitch');
    }
  }, [safeSetAuthMode, errorPrevention]);

  const handleSelectPlan = useCallback((plan: string) => {
    try {
      safeSetShowPricingModal(false);
      if (plan === 'trial') {
        safeSetShowAuthModal(true);
        safeSetAuthMode('register');
      } else {
        toast({
          title: "Plan Selected",
          description: `You selected the ${plan} plan. Redirecting to checkout...`,
        });
      }
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleSelectPlan');
    }
  }, [toast, safeSetShowPricingModal, safeSetShowAuthModal, safeSetAuthMode, errorPrevention]);

  console.log("✅ Event handlers defined successfully"); // Debug log

  // Safe navigation handlers
  const handlePrevMonth = useCallback(() => {
    try {
      safeSetCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handlePrevMonth');
    }
  }, [safeSetCurrentDate, errorPrevention]);

  const handleNextMonth = useCallback(() => {
    try {
      safeSetCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleNextMonth');
    }
  }, [safeSetCurrentDate, errorPrevention]);

  const handleViewChange = useCallback(() => {
    // Placeholder for view change
  }, []);

  // Safe modal close handlers
  const handleCloseCreateModal = useCallback(() => {
    try {
      safeSetIsCreateModalOpen(false);
      safeSetSelectedDate(null);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleCloseCreateModal');
    }
  }, [safeSetIsCreateModalOpen, safeSetSelectedDate, errorPrevention]);

  const handleCloseAuthModal = useCallback(() => {
    try {
      safeSetShowAuthModal(false);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleCloseAuthModal');
    }
  }, [safeSetShowAuthModal, errorPrevention]);

  const handleClosePricingModal = useCallback(() => {
    try {
      safeSetShowPricingModal(false);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleClosePricingModal');
    }
  }, [safeSetShowPricingModal, errorPrevention]);

  // Safe button click handlers
  const handleCreateEventClick = useCallback(() => {
    try {
      console.log('Create event button clicked - User:', user, 'Dev mode:', isDeveloperMode); // Debug log
      
      if (!user && !isDeveloperMode) {
        console.log('Showing pricing modal - no user and no dev mode'); // Debug log
        safeSetShowPricingModal(true);
        return;
      }
      
      console.log('Opening create event modal'); // Debug log
      safeSetIsCreateModalOpen(true);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleCreateEventClick');
    }
  }, [user, isDeveloperMode, safeSetIsCreateModalOpen, safeSetShowPricingModal, errorPrevention]);

  const handleSignInClick = useCallback(() => {
    try {
      safeSetShowAuthModal(true);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleSignInClick');
    }
  }, [safeSetShowAuthModal, errorPrevention]);

  const handleUpgradeClick = useCallback(() => {
    try {
      safeSetShowPricingModal(true);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleUpgradeClick');
    }
  }, [safeSetShowPricingModal, errorPrevention]);

  const handleGetStartedClick = useCallback(() => {
    try {
      safeSetShowPricingModal(true);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleGetStartedClick');
    }
  }, [safeSetShowPricingModal, errorPrevention]);

  // Safe logout handler
  const handleLogout = useCallback(() => {
    try {
      logout();
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleLogout');
    }
  }, [logout, errorPrevention]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading NeuroCal...</p>
        </div>
      </div>
    );
  }

  // Error state - show recovery options
  if (errorPrevention.isErrorState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Component Error Detected</h1>
          <p className="text-muted-foreground mb-6">
            We've detected some issues in the calendar component. Let's fix this!
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={errorPrevention.attemptRecovery}
              className="w-full bg-primary hover:bg-primary-glow"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try to Fix
            </Button>
            
            <Button
              onClick={errorPrevention.forceRecovery}
              variant="outline"
              className="w-full"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Force Recovery
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Error count: {errorPrevention.errorCount}
          </p>
        </div>
      </div>
    );
  }

  console.log("✅ About to render main JSX..."); // Debug log

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <div className="logo-icon">NC</div>
            <div className="logo-text">
              <div className="logo-title">NeuroCal</div>
              <div className="logo-subtitle">AI-Powered Calendar</div>
            </div>
          </div>
          <div className="header-actions">
            {/* Developer Mode Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsDeveloperMode(!isDeveloperMode)}
              className={`btn ${isDeveloperMode ? 'bg-accent text-accent-foreground' : 'btn-outline'}`}
              title="Toggle Developer Mode"
            >
              <Code className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">
                {isDeveloperMode ? 'Dev Mode ON' : 'Dev Mode'}
              </span>
              <span className="sm:hidden">
                {isDeveloperMode ? 'ON' : 'Dev'}
              </span>
            </Button>
            
            {(user || isDeveloperMode) ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCreateEventClick} className="btn btn-outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
                <Link to="/crm">
                  <Button variant="outline" size="sm" className="btn btn-outline">
                    <Users className="h-4 w-4 mr-2" />
                    CRM
                  </Button>
                </Link>
                {user ? (
                  <Button variant="outline" size="sm" onClick={handleLogout} className="btn btn-outline">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <div className="bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    Dev Mode
                  </div>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleSignInClick} className="btn btn-outline">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button onClick={handleUpgradeClick} className="btn btn-primary">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Demo Mode Banner */}
        {!user && !isDeveloperMode && (
          <div className="demo-banner">
            <div className="demo-content">
              <div className="demo-icon">i</div>
              <div className="demo-text">
                <h3>Demo Mode</h3>
                <p>You're viewing the calendar in demo mode. Sign up for a free trial to save events and unlock AI features!</p>
              </div>
            </div>
            <Button 
              onClick={handleGetStartedClick} 
              size="sm" 
              className="btn btn-primary"
            >
              <Star className="h-4 w-4 mr-2" />
              Get Started Free
            </Button>
          </div>
        )}

        {/* Developer Mode Banner */}
        {isDeveloperMode && (
          <div className="demo-banner bg-accent/10 border-accent/30">
            <div className="demo-content">
              <Code className="h-6 w-6 text-accent flex-shrink-0" />
              <div className="demo-text">
                <h3>Developer Mode Enabled</h3>
                <p className="hidden sm:block">You can now test all features including AI, CRM, and premium functionality without authentication or subscriptions!</p>
                <p className="sm:hidden">Test all features without authentication!</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/crm">
                <Button size="sm" variant="outline" className="border-accent text-accent w-full sm:w-auto">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Test CRM</span>
                  <span className="sm:hidden">CRM</span>
                </Button>
              </Link>
              <Button 
                onClick={() => setIsDeveloperMode(false)}
                size="sm"
                variant="outline"
                className="border-accent/50 text-accent/70 w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exit Dev Mode</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="space-y-6">
          {/* Calendar */}
          <div className="calendar-container">
            <Suspense fallback={<div className="p-4 bg-card rounded-lg animate-pulse border border-border">
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>}>
              <ComponentSafetyWrapper
                componentName="InteractiveCalendar"
                isolationLevel="moderate"
                autoRecover={true}
                retryCount={3}
              >
                <InteractiveCalendar 
                  events={events}
                  onCreateEvent={handleCreateEvent}
                  onDeleteEvent={handleDeleteEvent}
                  currentDate={currentDate}
                  onMonthChange={safeSetCurrentDate}
                />
              </ComponentSafetyWrapper>
            </Suspense>
          </div>

          {/* AI Panel */}
          <div className="space-y-4">
            {!user && !isDeveloperMode ? (
              <div className="demo-banner">
                <div className="demo-content">
                  <Lock className="h-6 w-6 text-accent flex-shrink-0" />
                  <div className="demo-text">
                    <h3>Premium Feature</h3>
                    <p>AI Event Creation requires Basic plan</p>
                  </div>
                </div>
                <Button 
                  onClick={handleUpgradeClick}
                  size="sm"
                  className="btn btn-primary"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Basic
                </Button>
              </div>
            ) : (
              <Suspense fallback={<AIPanelFallback />}>
                <ComponentSafetyWrapper
                  componentName="AIPanel"
                  isolationLevel="loose"
                  autoRecover={true}
                  retryCount={5}
                >
                  <AIPanel 
                    upcomingEvents={events}
                    onCreateEvent={handleAICreateEvent} 
                  />
                </ComponentSafetyWrapper>
              </Suspense>
            )}
          </div>

          {/* Developer Mode Events Display */}
          {isDeveloperMode && events.length > 0 && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-accent mb-3 flex items-center gap-2">
                <Code className="h-5 w-5" />
                <span className="hidden sm:inline">Developer Mode Events</span>
                <span className="sm:hidden">Dev Events</span>
                <span className="text-accent/70">({events.length})</span>
              </h3>
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="bg-white dark:bg-gray-800 rounded-md p-3 border border-accent/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          <span className="hidden sm:inline">{event.date.toLocaleDateString()}</span>
                          <span className="sm:hidden">{event.date.toLocaleDateString('short')}</span>
                          {' '}at {event.time} ({event.duration})
                        </p>
                        {event.location && (
                          <p className="text-sm text-muted-foreground truncate">📍 {event.location}</p>
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded-full ${event.color} flex-shrink-0`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Event Modal */}
      <Suspense fallback={<div>Loading modal...</div>}>
        <ComponentSafetyWrapper
          componentName="CreateEventModal"
          isolationLevel="strict"
          autoRecover={false}
          retryCount={1}
        >
          <CreateEventModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            onCreateEvent={handleCreateEvent}
            selectedDate={selectedDate}
          />
        </ComponentSafetyWrapper>
      </Suspense>
      
      {/* Debug Info - Remove in production */}
      {isDeveloperMode && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto bg-accent/90 text-accent-foreground p-3 rounded-lg text-xs z-50 max-w-xs md:max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">🐛 Debug Info</div>
            <button 
              onClick={() => setIsDeveloperMode(false)}
              className="text-accent-foreground/70 hover:text-accent-foreground"
              title="Exit Dev Mode"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Modal:</span>
              <span className={isCreateModalOpen ? 'text-green-300' : 'text-red-300'}>
                {isCreateModalOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="text-accent-foreground/80">
                {selectedDate ? selectedDate.toLocaleDateString() : 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Events:</span>
              <span className="text-accent-foreground/80">{events.length}</span>
            </div>
            <div className="flex justify-between">
              <span>User:</span>
              <span className={user ? 'text-green-300' : 'text-yellow-300'}>
                {user ? 'Logged In' : 'Not Logged In'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Simple Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative border border-border shadow-lg">
            <button 
              onClick={handleCloseAuthModal} 
              className="absolute top-4 right-4 p-2 hover:bg-warm-light rounded-full"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {authMode === 'login' 
                  ? 'Sign in to access your calendar' 
                  : 'Join NeuroCal to get started'
                }
              </p>
            </div>

            <div className="space-y-4">
              {authMode === 'login' ? (
                <Suspense fallback={<div className="p-4 text-center">Loading login form...</div>}>
                  <ComponentSafetyWrapper
                    componentName="LoginForm"
                    isolationLevel="moderate"
                    autoRecover={true}
                    retryCount={3}
                  >
                    <LoginForm />
                  </ComponentSafetyWrapper>
                </Suspense>
              ) : (
                <Suspense fallback={<div className="p-4 text-center">Loading registration form...</div>}>
                  <ComponentSafetyWrapper
                    componentName="RegisterForm"
                    isolationLevel="moderate"
                    autoRecover={true}
                    retryCount={3}
                  >
                    <RegisterForm />
                  </ComponentSafetyWrapper>
                </Suspense>
              )}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleAuthModeSwitch}
                className="text-primary hover:text-primary-glow text-sm font-medium"
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full relative border border-border shadow-lg">
            <button 
              onClick={handleClosePricingModal} 
              className="absolute top-4 right-4 p-2 hover:bg-warm-light rounded-full"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Plan</h2>
              <p className="text-muted-foreground text-lg">Start with a free trial, then choose the plan that fits your needs</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Trial */}
              <div className="border-2 border-primary/30 rounded-lg p-6 bg-primary/5 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-3 py-1">Most Popular</Badge>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-2">7-Day Free Trial</h3>
                  <div className="text-3xl font-bold text-primary mb-4">$0</div>
                  <p className="text-muted-foreground mb-6">Perfect for trying out all features</p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Basic calendar sync with Google Calendar, Outlook, and Apple Calendar
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Simple AI event creation with natural language ("Schedule meeting tomorrow at 2pm")
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Up to 10 AI-generated events during trial period
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Basic email reminders and mobile app access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Limited customer support (FAQ and help articles only)
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleSelectPlan('trial')} 
                    className="w-full bg-primary hover:bg-primary-glow"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Start Free Trial
                  </Button>
                </div>
              </div>

              {/* Basic Plan */}
              <div className="border border-border rounded-lg p-6 bg-card">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-2">Basic Plan</h3>
                  <div className="text-3xl font-bold text-foreground mb-4">$4.99<span className="text-lg text-muted-foreground">/month</span></div>
                  <p className="text-muted-foreground mb-6">Great for personal use</p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Unlimited AI event creation and smart scheduling suggestions
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Calendar sync with major providers and basic conflict detection
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Custom notification settings and email reminders
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Integration with 1 third-party app (Zoom or Teams)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Standard email support with basic time tracking insights
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleSelectPlan('basic')} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Choose Basic
                  </Button>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-accent/30 rounded-lg p-6 bg-accent/5 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-accent text-white px-3 py-1">Best Value</Badge>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-2">Pro Plan</h3>
                  <div className="text-3xl font-bold text-accent mb-4">$9.99<span className="text-lg text-accent/70">/month</span></div>
                  <p className="text-muted-foreground mb-6">Perfect for power users & teams</p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Advanced AI scheduling with smart buffer time and travel time calculations
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Team collaboration features, shared calendars, and meeting room booking
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Detailed analytics dashboard with productivity insights and time tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      AI meeting summaries, agenda suggestions, and automatic follow-up reminders
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Priority chat support with advanced calendar sharing and export options
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleSelectPlan('pro')} 
                    className="w-full bg-accent hover:bg-accent/90"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Choose Pro
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
