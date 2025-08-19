import React, { useState, useCallback, Suspense, lazy, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Event } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, Calendar, Sparkles, Zap, Users, Clock, X, BarChart3, Crown, Star, Lock, Plus, Check, Badge, Brain, AlertTriangle } from "lucide-react";

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
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [events, setEvents] = useState<Event[]>([]);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    console.log("✅ React hooks called successfully"); // Debug log

    // Event handlers
    const handleDateClick = useCallback((date: Date) => {
      if (!user) {
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
      setIsCreateModalOpen(false);
      toast({
        title: "Event Created! 🎉",
        description: `"${newEvent.title}" has been added to your calendar.`,
      });
    }, [toast]);

    const handleAICreateEvent = useCallback((eventText: string) => {
      if (!user) {
        setShowPricingModal(true);
        return;
      }
      // AI event creation logic would go here
      toast({
        title: "AI Event Creation",
        description: "This feature requires authentication.",
      });
    }, [user, toast]);

    const handleAuthModeSwitch = useCallback(() => {
      setAuthMode(prev => prev === 'login' ? 'register' : 'login');
    }, []);

    const handleSelectPlan = useCallback((plan: string) => {
      setShowPricingModal(false);
      if (plan === 'trial') {
        setShowAuthModal(true);
        setAuthMode('register');
      } else {
        toast({
          title: "Plan Selected",
          description: `You selected the ${plan} plan. Redirecting to checkout...`,
        });
      }
    }, [toast]);

    console.log("✅ Event handlers defined successfully"); // Debug log

    // AuthModal component
    const AuthModal = ({ isOpen, onClose, authMode, onAuthModeSwitch }: {
      isOpen: boolean;
      onClose: () => void;
      authMode: 'login' | 'register';
      onAuthModeSwitch: () => void;
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
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
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
                  <LoginForm />
                </Suspense>
              ) : (
                <Suspense fallback={<div className="p-4 text-center">Loading registration form...</div>}>
                  <RegisterForm />
                </Suspense>
              )}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={onAuthModeSwitch}
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
      );
    };

    // FeatureGate component
    const FeatureGate = ({ children, feature, plan, onUpgrade }: {
      children: React.ReactNode;
      feature: string;
      plan: 'basic' | 'pro';
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

    // PricingModal component
    const PricingModal = ({ isOpen, onClose, onSelectPlan }: {
      isOpen: boolean;
      onClose: () => void;
      onSelectPlan: (plan: string) => void;
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
          <div ref={modalRef} className="bg-white rounded-lg p-8 max-w-4xl w-full relative">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
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
                    onClick={() => onSelectPlan('trial')} 
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
                    onClick={() => onSelectPlan('basic')} 
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
                    onClick={() => onSelectPlan('pro')} 
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
      );
    };

    console.log("✅ Component definitions completed"); // Debug log

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
                    <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                    <Button variant="outline" size="sm" onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                    <Button onClick={() => setShowPricingModal(true)}>
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
                  onClick={() => setShowPricingModal(true)} 
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
                 <CalendarHeader 
                   currentDate={currentDate}
                   onPrevMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                   onNextMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                   view="month"
                   onViewChange={() => {}}
                 />
               </Suspense>
             </div>

            {/* Calendar Grid */}
            <div>
              <Suspense fallback={<CalendarGridFallback />}>
                <CalendarGrid 
                  currentDate={currentDate}
                  events={events}
                  onDateClick={handleDateClick}
                  selectedDate={selectedDate}
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
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">Something went wrong</h1>
          <p className="text-red-700 mb-4">We're working to fix this issue. Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }
};

export default Index;
