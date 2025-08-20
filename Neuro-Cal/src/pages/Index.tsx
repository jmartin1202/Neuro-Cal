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
const SmartCalendar = lazy(() => import("@/components/SmartCalendar"));
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
  const [events, setEvents] = useState<Event[]>([]);
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
      if (!user && !isDeveloperMode) {
        safeSetShowPricingModal(true);
        return;
      }
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
      
      safeSetEvents(prev => [...prev, newEvent]);
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
      if (!user && !isDeveloperMode) {
        safeSetShowPricingModal(true);
        return;
      }
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
              <Code className="h-4 w-4 mr-2" />
              {isDeveloperMode ? 'Dev Mode ON' : 'Dev Mode'}
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
                <p>You can now test all features including AI, CRM, and premium functionality without authentication or subscriptions!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/crm">
                <Button size="sm" variant="outline" className="border-accent text-accent">
                  <Users className="h-4 w-4 mr-2" />
                  Test CRM
                </Button>
              </Link>
              <Button 
                onClick={() => setIsDeveloperMode(false)}
                size="sm"
                variant="outline"
                className="border-accent/50 text-accent/70"
              >
                <X className="h-4 w-4 mr-2" />
                Exit Dev Mode
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="space-y-6">
          {/* Smart Calendar */}
          <div className="calendar-container">
            <Suspense fallback={<div className="p-4 bg-card rounded-lg animate-pulse border border-border">
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>}>
              <ComponentSafetyWrapper
                componentName="SmartCalendar"
                isolationLevel="moderate"
                autoRecover={true}
                retryCount={3}
              >
                <SmartCalendar />
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
