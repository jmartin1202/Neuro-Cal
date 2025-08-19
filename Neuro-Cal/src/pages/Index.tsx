import React, { useState, useCallback, Suspense, lazy, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Event } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, Calendar, Sparkles, Zap, Users, Clock, X, BarChart3, Crown, Star, Lock, Plus, Check, Badge, Brain, AlertTriangle, RefreshCw } from "lucide-react";
import { useErrorPrevention } from "@/hooks/useErrorPrevention";
import { ComponentSafetyWrapper } from "@/components/ComponentSafetyWrapper";

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
  <div className="p-4 bg-gradient-card rounded-lg">
    <div className="space-y-3">
      <div className="h-6 w-32 bg-gradient-primary rounded animate-pulse"></div>
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
      if (!user) {
        safeSetShowPricingModal(true);
        return;
      }
      safeSetSelectedDate(date);
      safeSetIsCreateModalOpen(true);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleDateClick');
    }
  }, [user, safeSetShowPricingModal, safeSetSelectedDate, safeSetIsCreateModalOpen, errorPrevention]);

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
      if (!user) {
        safeSetShowPricingModal(true);
        return;
      }
      // AI event creation logic would go here
      toast({
        title: "AI Event Creation",
        description: "This feature requires authentication.",
      });
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleAICreateEvent');
    }
  }, [user, toast, safeSetShowPricingModal, errorPrevention]);

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
      safeSetIsCreateModalOpen(true);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleCreateEventClick');
    }
  }, [safeSetIsCreateModalOpen, errorPrevention]);

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Component Error Detected</h1>
          <p className="text-gray-600 mb-6">
            We've detected some issues in the calendar component. Let's fix this!
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={errorPrevention.attemptRecovery}
              className="w-full bg-blue-600 hover:bg-blue-700"
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
          
          <p className="text-xs text-gray-500 mt-4">
            Error count: {errorPrevention.errorCount}
          </p>
        </div>
      </div>
    );
  }

  console.log("✅ About to render main JSX..."); // Debug log

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  NeuroCal
                </h1>
                <p className="text-xs text-muted-foreground">AI-Powered Calendar</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCreateEventClick}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleSignInClick}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button onClick={handleUpgradeClick}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {!user && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Demo Mode</h3>
                <p className="text-sm text-blue-700">
                  You're viewing the calendar in demo mode. Sign up for a free trial to save events and unlock AI features!
                </p>
              </div>
              <Button 
                onClick={handleGetStartedClick} 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Star className="h-4 w-4 mr-2" />
                Get Started Free
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Calendar Header */}
          <div>
            <Suspense fallback={<CalendarHeaderFallback />}>
              <ComponentSafetyWrapper
                componentName="CalendarHeader"
                isolationLevel="moderate"
                autoRecover={true}
                retryCount={3}
              >
                <CalendarHeader 
                  currentDate={currentDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  view="month"
                  onViewChange={handleViewChange}
                />
              </ComponentSafetyWrapper>
            </Suspense>
          </div>

          {/* Calendar Grid */}
          <div>
            <Suspense fallback={<CalendarGridFallback />}>
              <ComponentSafetyWrapper
                componentName="CalendarGrid"
                isolationLevel="moderate"
                autoRecover={true}
                retryCount={3}
              >
                <CalendarGrid 
                  currentDate={currentDate}
                  events={events}
                  onDateClick={handleDateClick}
                  selectedDate={selectedDate}
                />
              </ComponentSafetyWrapper>
            </Suspense>
          </div>

          {/* AI Panel */}
          <div className="space-y-4">
            {!user ? (
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-8 w-8 text-yellow-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900">Premium Feature</h3>
                    <p className="text-sm text-yellow-700">
                      AI Event Creation requires Basic plan
                    </p>
                  </div>
                  <Button 
                    onClick={handleUpgradeClick}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Basic
                  </Button>
                </div>
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
        </div>
      </main>

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
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={handleCloseAuthModal} 
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600 mt-2">
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
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full relative">
            <button 
              onClick={handleClosePricingModal} 
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
              <p className="text-gray-600 text-lg">Start with a free trial, then choose the plan that fits your needs</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Trial */}
              <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">7-Day Free Trial</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">$0</div>
                  <p className="text-gray-600 mb-6">Perfect for trying out all features</p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Full calendar access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      AI event creation
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Event management
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Calendar sync
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleSelectPlan('trial')} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Start Free Trial
                  </Button>
                </div>
              </div>

              {/* Basic Plan */}
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Membership</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$4.99<span className="text-lg text-gray-500">/month</span></div>
                  <p className="text-gray-600 mb-6">Great for personal use</p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Everything in Free Trial
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Advanced AI features
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Export capabilities
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
              <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-3 py-1">Best Value</Badge>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Version</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-4">$9.99<span className="text-lg text-purple-500">/month</span></div>
                  <p className="text-gray-600 mb-6">Perfect for power users & teams</p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Everything in Basic
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Team collaboration
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Advanced analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      API access
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleSelectPlan('pro')} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
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
