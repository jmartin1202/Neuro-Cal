import React, { useState, useCallback, Suspense, lazy, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Event } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, Calendar, Sparkles, Zap, Users, Clock, X, BarChart3, Crown, Star, Lock, Plus, Check, Badge, Brain, AlertTriangle, RefreshCw, Code, Settings, Bell, Palette, Globe, Search, Edit, Trash2 } from "lucide-react";
import { useErrorPrevention } from "@/hooks/useErrorPrevention";
import { ComponentSafetyWrapper } from "@/components/ComponentSafetyWrapper";

// Lazy load components to isolate issues
const InteractiveCalendar = lazy(() => import("@/components/InteractiveCalendar"));
const AIPanel = lazy(() => import("@/components/AIPanel").then(module => ({ default: module.AIPanel })));
const CreateEventModal = lazy(() => import("@/components/CreateEventModal").then(module => ({ default: module.CreateEventModal })));
const LoginForm = lazy(() => import("@/components/auth/LoginForm").then(module => ({ default: module.LoginForm })));
const RegisterForm = lazy(() => import("@/components/auth/RegisterForm").then(module => ({ default: module.RegisterForm })));
const CRMDashboard = lazy(() => import("@/components/CRMDashboard"));




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

  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'crm' | 'settings'>('calendar');
  const [settings, setSettings] = useState({
    notifications: true,
    emailReminders: true,
    darkMode: false,
    timeZone: 'UTC-5',
    language: 'English',
    weekStart: 'Sunday',
    autoSync: true,
    defaultMeetingLength: 30
  });
  
  // Enhanced Calendar State
  const [calendarViewMode, setCalendarViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [calendarSearchQuery, setCalendarSearchQuery] = useState('');
  const [calendarFilterType, setCalendarFilterType] = useState('all');
  const [calendarSortBy, setCalendarSortBy] = useState<'date' | 'title'>('date');
  const [showCalendarSyncModal, setShowCalendarSyncModal] = useState(false);
  const [calendarSyncSettings, setCalendarSyncSettings] = useState({
    googleCalendar: { connected: false, lastSync: null },
    appleCalendar: { connected: false, lastSync: null },
    outlookCalendar: { connected: false, lastSync: null }
  });
  const [calendarSyncInProgress, setCalendarSyncInProgress] = useState<Record<string, boolean>>({});
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showEventEditModal, setShowEventEditModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    time: '',
    description: '',
    type: 'meeting' as Event['type'],
    reminders: [] as string[]
  });
  
  // CRM State



  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Enhanced Calendar Constants
  const reminderOptions = [
    { value: '5m', label: '5 minutes before' },
    { value: '10m', label: '10 minutes before' },
    { value: '15m', label: '15 minutes before' },
    { value: '30m', label: '30 minutes before' },
    { value: '1h', label: '1 hour before' },
    { value: '2h', label: '2 hours before' },
    { value: '1d', label: '1 day before' },
    { value: '2d', label: '2 days before' },
    { value: '1w', label: '1 week before' }
  ];

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
      console.log('Date clicked:', date, 'User:', user); // Debug log
      
      if (!user) {
        console.log('Showing pricing modal - no user'); // Debug log
        safeSetShowPricingModal(true);
        return;
      }
      
      console.log('Opening create event modal for date:', date); // Debug log
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
      console.log('Create event button clicked - User:', user); // Debug log
      
      if (!user) {
        console.log('Showing pricing modal - no user'); // Debug log
        safeSetShowPricingModal(true);
        return;
      }
      
      console.log('Opening create event modal'); // Debug log
      safeSetIsCreateModalOpen(true);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleCreateEventClick');
    }
  }, [user, safeSetIsCreateModalOpen, safeSetShowPricingModal, errorPrevention]);

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
  
  // Enhanced Calendar Functions
  const handleEditEvent = useCallback((event: Event) => {
    try {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        time: event.time || '',
        description: (event as any).description || '',
        type: event.type,
        reminders: (event as any).reminders || []
      });
      setShowEventEditModal(true);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleEditEvent');
    }
  }, [errorPrevention]);
  
  const handleUpdateEvent = useCallback(() => {
    try {
      if (!editingEvent || !eventForm.title.trim()) return;
      
      const updatedEvent: Event = {
        ...editingEvent,
        title: eventForm.title,
        time: eventForm.time,
        type: eventForm.type
      };
      
      safeSetEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? updatedEvent : event
      ));
      
      setShowEventEditModal(false);
      setEditingEvent(null);
      setEventForm({ title: '', time: '', description: '', type: 'meeting', reminders: [] });
      
      toast({
        title: "Event Updated! ✨",
        description: `"${updatedEvent.title}" has been updated successfully.`,
      });
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleUpdateEvent');
    }
  }, [editingEvent, eventForm, safeSetEvents, toast, errorPrevention]);
  
  const handleCalendarSync = async (calendarType: string) => {
    try {
      setCalendarSyncInProgress(prev => ({ ...prev, [calendarType]: true }));
      
      // Simulate API call to external calendar service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection
      setCalendarSyncSettings(prev => ({
        ...prev,
        [calendarType]: {
          connected: !prev[calendarType as keyof typeof prev].connected,
          lastSync: prev[calendarType as keyof typeof prev].connected ? null : new Date().toISOString()
        }
      }));
      
      setCalendarSyncInProgress(prev => ({ ...prev, [calendarType]: false }));
      
      toast({
        title: "Calendar Sync Updated",
        description: `${calendarType} calendar has been ${calendarSyncSettings[calendarType as keyof typeof calendarSyncSettings].connected ? 'disconnected' : 'connected'} successfully.`,
      });
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleCalendarSync');
      setCalendarSyncInProgress(prev => ({ ...prev, [calendarType]: false }));
    }
  };
  
  const handleAddReminder = useCallback(() => {
    try {
      setEventForm(prev => ({
        ...prev,
        reminders: [...prev.reminders, '10m']
      }));
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleAddReminder');
    }
  }, [errorPrevention]);
  
  const handleRemoveReminder = useCallback((index: number) => {
    try {
      setEventForm(prev => ({
        ...prev,
        reminders: prev.reminders.filter((_, i) => i !== index)
      }));
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleRemoveReminder');
    }
  }, [errorPrevention]);
  
  const handleReminderChange = useCallback((index: number, value: string) => {
    try {
      setEventForm(prev => ({
        ...prev,
        reminders: prev.reminders.map((reminder, i) => i === index ? value : reminder)
      }));
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleReminderChange');
    }
  }, [errorPrevention]);
  
  const getFilteredEvents = useCallback(() => {
    try {
      let filtered = events;
      
      if (calendarFilterType !== 'all') {
        filtered = filtered.filter(event => event.type === calendarFilterType);
      }
      
      if (calendarSearchQuery.trim()) {
        filtered = filtered.filter(event => 
          event.title.toLowerCase().includes(calendarSearchQuery.toLowerCase())
        );
      }
      
      return filtered.sort((a, b) => {
        if (calendarSortBy === 'date') {
          return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
        } else if (calendarSortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'getFilteredEvents');
      return events;
    }
  }, [events, calendarFilterType, calendarSearchQuery, calendarSortBy, errorPrevention]);

  // Safe logout handler
  const handleLogout = useCallback(() => {
    try {
      logout();
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'handleLogout');
    }
  }, [logout, errorPrevention]);

  // Settings Functions
  const updateSetting = useCallback((key: string, value: any) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      toast({
        title: "Setting Updated",
        description: `${key} has been updated successfully.`,
      });
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'updateSetting');
    }
  }, [toast, errorPrevention]);

  const toggleSettings = useCallback(() => {
    try {
      setShowSettings(prev => !prev);
    } catch (error) {
      errorPrevention.trackError(error instanceof Error ? error : String(error), 'toggleSettings');
    }
  }, [errorPrevention]);



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

            
            {/* Tab Navigation - Available to all users */}
            <div className="flex space-x-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  activeTab === 'calendar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar size={16} />
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('crm')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  activeTab === 'crm' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users size={16} />
                CRM
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  activeTab === 'settings' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings size={16} />
                Settings
              </button>
            </div>

            {user ? (
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
        {!user && (
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



        {/* Main Content */}
        <main className="space-y-6">
          {/* Tab Content */}
          {activeTab === 'calendar' && (
            <>
              {/* Enhanced Calendar Header */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Enhanced Calendar</h2>
                      <p className="text-muted-foreground">AI-Powered Calendar with Advanced Features</p>
                    </div>
                  </div>
                  
                  {/* Calendar Sync Button */}
                  <Button
                    onClick={() => setShowCalendarSyncModal(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync Calendars
                  </Button>
                </div>
                
                {/* View Mode Selector */}
                <div className="flex space-x-1 bg-muted rounded-lg p-1 mb-6">
                  <button
                    onClick={() => setCalendarViewMode('daily')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      calendarViewMode === 'daily' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('weekly')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      calendarViewMode === 'weekly' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('monthly')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      calendarViewMode === 'monthly' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('yearly')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      calendarViewMode === 'yearly' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
                
                {/* Search and Filter Bar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={calendarSearchQuery}
                      onChange={(e) => setCalendarSearchQuery(e.target.value)}
                      placeholder="Search events..."
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                    />
                  </div>
                  
                  <select
                    value={calendarFilterType}
                    onChange={(e) => setCalendarFilterType(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  >
                    <option value="all">All Types</option>
                    <option value="meeting">Meetings</option>
                    <option value="focus">Focus Time</option>
                    <option value="break">Breaks</option>
                    <option value="travel">Travel</option>
                  </select>
                  
                  <select
                    value={calendarSortBy}
                    onChange={(e) => setCalendarSortBy(e.target.value as 'date' | 'title')}
                    className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                  </select>
                </div>
                
                {/* Calendar Content */}
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
                        viewMode={calendarViewMode}
                      />
                    </ComponentSafetyWrapper>
                  </Suspense>
                </div>
                
                {/* Enhanced Event Management */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Event Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredEvents().map((event) => (
                      <div key={event.id} className="bg-background rounded-lg p-4 border border-border hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {event.date?.toLocaleDateString()} at {event.time} ({event.duration})
                            </p>
                            {event.location && (
                              <p className="text-sm text-muted-foreground">📍 {event.location}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                              title="Edit event"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                              title="Delete event"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                            event.type === 'focus' ? 'bg-green-100 text-green-800' :
                            event.type === 'break' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {event.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Panel */}
              <div className="space-y-4">
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
                
                {/* Demo Mode Notice */}
                {!user && (
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-accent" />
                      <div>
                        <h3 className="text-sm font-medium text-accent">Demo Mode - AI Enabled!</h3>
                        <p className="text-xs text-accent/70">
                          You're testing AI Event Creation in demo mode. Try natural language like "Schedule team meeting tomorrow at 2pm"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* CRM Tab */}
          {activeTab === 'crm' && (
            <Suspense fallback={
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="space-y-3">
                  <div className="h-6 w-32 bg-primary/20 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                  <div className="h-10 bg-muted rounded animate-pulse"></div>
                  <div className="h-20 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            }>
              <CRMDashboard />
            </Suspense>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Settings</h2>

              {/* Notice for non-authenticated users */}
              {!user && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-accent" />
                    <div>
                      <h3 className="text-sm font-medium text-accent">Demo Mode</h3>
                      <p className="text-xs text-accent/70">
                        You're viewing settings in demo mode. Some features may require authentication to work properly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bell size={20} className="text-primary" />
                  <h3 className="text-lg font-medium">Notifications</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Push Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => updateSetting('notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email Reminders</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailReminders}
                        onChange={(e) => updateSetting('emailReminders', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Palette size={20} className="text-primary" />
                  <h3 className="text-lg font-medium">Appearance</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dark Mode</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.darkMode}
                        onChange={(e) => updateSetting('darkMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Week Starts On</label>
                    <select
                      value={settings.weekStart}
                      onChange={(e) => updateSetting('weekStart', e.target.value)}
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                    >
                      <option value="Sunday">Sunday</option>
                      <option value="Monday">Monday</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Regional */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe size={20} className="text-primary" />
                  <h3 className="text-lg font-medium">Regional Settings</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Time Zone</label>
                    <select
                      value={settings.timeZone}
                      onChange={(e) => updateSetting('timeZone', e.target.value)}
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                    >
                      <option value="UTC-8">Pacific Time (UTC-8)</option>
                      <option value="UTC-7">Mountain Time (UTC-7)</option>
                      <option value="UTC-6">Central Time (UTC-6)</option>
                      <option value="UTC-5">Eastern Time (UTC-5)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Calendar Settings */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={20} className="text-primary" />
                  <h3 className="text-lg font-medium">Calendar Settings</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Auto-sync Events</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoSync}
                        onChange={(e) => updateSetting('autoSync', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Default Meeting Length (minutes)</label>
                    <select
                      value={settings.defaultMeetingLength}
                      onChange={(e) => updateSetting('defaultMeetingLength', parseInt(e.target.value))}
                      className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>
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




      {/* Event Edit Modal */}
      {showEventEditModal && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md border border-border">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground">Edit Event</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingEvent.date?.toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEventEditModal(false);
                  setEditingEvent(null);
                  setEventForm({ title: '', time: '', description: '', type: 'meeting', reminders: [] });
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground outline-none"
                />
              </div>
              
              {/* Event Time */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground outline-none"
                />
              </div>
              
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Event Type
                </label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground outline-none"
                >
                  <option value="meeting">Meeting</option>
                  <option value="focus">Focus Time</option>
                  <option value="break">Break</option>
                  <option value="travel">Travel</option>
                </select>
              </div>
              
              {/* Event Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Edit className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter event description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground outline-none resize-none"
                />
              </div>
              
              {/* Reminders */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">
                    <Bell className="w-4 h-4 inline mr-1" />
                    Reminders
                  </label>
                  <button
                    type="button"
                    onClick={handleAddReminder}
                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Reminder</span>
                  </button>
                </div>
                
                {eventForm.reminders.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No reminders set</p>
                ) : (
                  <div className="space-y-2">
                    {eventForm.reminders.map((reminder, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <select
                          value={reminder}
                          onChange={(e) => handleReminderChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground outline-none text-sm"
                        >
                          {reminderOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveReminder(index)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Remove reminder"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <button
                onClick={() => {
                  setShowEventEditModal(false);
                  setEditingEvent(null);
                  setEventForm({ title: '', time: '', description: '', type: 'meeting', reminders: [] });
                }}
                className="px-4 py-2 text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEvent}
                disabled={!eventForm.title.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors"
              >
                Update Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Sync Modal */}
      {showCalendarSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg border border-border">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Calendar Sync</h2>
              </div>
              <button
                onClick={() => setShowCalendarSyncModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <p className="text-sm text-muted-foreground">
                Connect your external calendars to sync events seamlessly with NeuroCal.
              </p>
              
              {/* Google Calendar */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Google Calendar</h3>
                      <p className="text-sm text-muted-foreground">
                        Status: {calendarSyncSettings.googleCalendar.connected ? (
                          <span className="text-green-600 font-medium">Connected</span>
                        ) : (
                          <span className="text-muted-foreground">Not connected</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCalendarSync('googleCalendar')}
                    disabled={calendarSyncInProgress.googleCalendar}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      calendarSyncSettings.googleCalendar.connected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {calendarSyncInProgress.googleCalendar ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : calendarSyncSettings.googleCalendar.connected ? (
                      'Disconnect'
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </div>
              
              {/* Apple Calendar */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Apple Calendar</h3>
                      <p className="text-sm text-muted-foreground">
                        Status: {calendarSyncSettings.appleCalendar.connected ? (
                          <span className="text-green-600 font-medium">Connected</span>
                        ) : (
                          <span className="text-muted-foreground">Not connected</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCalendarSync('appleCalendar')}
                    disabled={calendarSyncInProgress.appleCalendar}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      calendarSyncSettings.appleCalendar.connected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {calendarSyncInProgress.appleCalendar ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : calendarSyncSettings.appleCalendar.connected ? (
                      'Disconnect'
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </div>
              
              {/* Outlook Calendar */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Outlook Calendar</h3>
                      <p className="text-sm text-muted-foreground">
                        Status: {calendarSyncSettings.outlookCalendar.connected ? (
                          <span className="text-green-600 font-medium">Connected</span>
                        ) : (
                          <span className="text-muted-foreground">Not connected</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCalendarSync('outlookCalendar')}
                    disabled={calendarSyncInProgress.outlookCalendar}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      calendarSyncSettings.outlookCalendar.connected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {calendarSyncInProgress.outlookCalendar ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : calendarSyncSettings.outlookCalendar.connected ? (
                      'Disconnect'
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </div>
              
              {/* Sync Info */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Settings className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-primary mb-1">Sync Settings</h4>
                    <p className="text-sm text-primary/80">
                      Events sync automatically every 15 minutes when connected. Manual sync is available anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-border">
              <button
                onClick={() => setShowCalendarSyncModal(false)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
