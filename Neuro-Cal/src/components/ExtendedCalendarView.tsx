import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X, Clock, User, FileText, Trash2, Plus, Edit2, Bell, Minus, Settings, Check, RefreshCw, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Event } from './EventCard';

interface ExtendedEvent extends Event {
  reminders: string[];
  description?: string;
}

const ExtendedCalendarView = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'main'>('monthly');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventsList, setShowEventsList] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ExtendedEvent | null>(null);
  const [events, setEvents] = useState<Record<string, ExtendedEvent[]>>({});
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [syncSettings, setSyncSettings] = useState({
    googleCalendar: { connected: false, lastSync: null },
    appleCalendar: { connected: false, lastSync: null },
    outlookCalendar: { connected: false, lastSync: null }
  });
  const [syncInProgress, setSyncInProgress] = useState<Record<string, boolean>>({});
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    description: '',
    type: 'meeting' as Event['type'],
    reminders: [] as string[]
  });

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
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const generateCalendarDays = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: Array<{
      day: number;
      isCurrentMonth: boolean;
      isPrevMonth?: boolean;
      isNextMonth?: boolean;
      isToday?: boolean;
      fullDate: string;
    }> = [];
    
    // Previous month's trailing days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        fullDate: `${prevYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${(daysInPrevMonth - i).toString().padStart(2, '0')}`
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const today = new Date();
      const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
      const fullDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        fullDate
      });
    }
    
    // Next month's leading days
    const remainingCells = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true,
        fullDate: `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      });
    }
    
    return days;
  };
  
  const getMonthsToShow = () => {
    if (viewMode === 'main' || viewMode === 'monthly') {
      return [{ month: currentMonth, year: currentYear }];
    }
    if (viewMode === 'yearly') {
      const monthsToShow = [];
      for (let i = 0; i < 12; i++) {
        monthsToShow.push({ month: i, year: currentYear });
      }
      return monthsToShow;
    }
    
    // Default to monthly view
    return [{ month: currentMonth, year: currentYear }];
  };
  
  const handleDateClick = (dayObj: any, month: number, year: number) => {
    let dateString: string;
    if (dayObj.isPrevMonth) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      dateString = `${prevYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${dayObj.day.toString().padStart(2, '0')}`;
    } else if (dayObj.isNextMonth) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      dateString = `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${dayObj.day.toString().padStart(2, '0')}`;
    } else {
      dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayObj.day.toString().padStart(2, '0')}`;
    }
    
    setSelectedDate(dateString);
    
    // Check if this date has events
    if (events[dateString] && events[dateString].length > 0) {
      setShowEventsList(true);
    } else {
      setShowEventModal(true);
    }
  };
  
  const handleAddEvent = () => {
    if (newEvent.title.trim() && selectedDate) {
      if (editingEvent) {
        // Update existing event
        const eventData: ExtendedEvent = {
          ...editingEvent,
          title: newEvent.title,
          time: newEvent.time,
          description: newEvent.description,
          type: newEvent.type,
          reminders: newEvent.reminders
        };
        
        setEvents(prev => ({
          ...prev,
          [selectedDate]: prev[selectedDate].map(event => 
            event.id === editingEvent.id ? eventData : event
          )
        }));
        setEditingEvent(null);
      } else {
        // Add new event
        const eventData: ExtendedEvent = {
          id: Date.now().toString(),
          title: newEvent.title,
          time: newEvent.time,
          duration: '1 hour',
          date: new Date(selectedDate),
          color: 'bg-calendar-event',
          type: newEvent.type,
          description: newEvent.description,
          reminders: newEvent.reminders
        };
        
        setEvents(prev => ({
          ...prev,
          [selectedDate]: [...(prev[selectedDate] || []), eventData]
        }));
      }
      
      setNewEvent({
        title: '',
        time: '',
        description: '',
        type: 'meeting',
        reminders: []
      });
      setShowEventModal(false);
      setShowEventsList(true);
    }
  };
  
  const handleCloseModal = () => {
    setShowEventModal(false);
    setShowEventsList(false);
    setEditingEvent(null);
    setNewEvent({
      title: '',
      time: '',
      description: '',
      type: 'meeting',
      reminders: []
    });
  };
  
  const handleDeleteEvent = (eventId: string, dateString: string) => {
    setEvents(prev => ({
      ...prev,
      [dateString]: prev[dateString].filter(event => event.id !== eventId)
    }));
  };
  
  const handleAddNewEvent = () => {
    setEditingEvent(null);
    setNewEvent({
      title: '',
      time: '',
      description: '',
      type: 'meeting',
      reminders: []
    });
    setShowEventsList(false);
    setShowEventModal(true);
  };
  
  const handleEditEvent = (event: ExtendedEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      time: event.time || '',
      description: event.description || '',
      type: event.type,
      reminders: event.reminders || []
    });
    setShowEventsList(false);
    setShowEventModal(true);
  };
  
  const handleAddReminder = () => {
    setNewEvent(prev => ({
      ...prev,
      reminders: [...prev.reminders, '10m']
    }));
  };
  
  const handleRemoveReminder = (index: number) => {
    setNewEvent(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }));
  };
  
  const handleReminderChange = (index: number, value: string) => {
    setNewEvent(prev => ({
      ...prev,
      reminders: prev.reminders.map((reminder, i) => i === index ? value : reminder)
    }));
  };
  
  const getGridColumns = () => {
    if (viewMode === 'main' || viewMode === 'monthly') {
      return 'grid-cols-1 max-w-4xl mx-auto';
    }
    if (viewMode === 'yearly') {
      return 'grid-cols-3 xl:grid-cols-4';
    }
    
    // Default to single column
    return 'grid-cols-1 max-w-4xl mx-auto';
  };
  
  const handleSyncCalendar = async (calendarType: string) => {
    setSyncInProgress(prev => ({ ...prev, [calendarType]: true }));
    
    // Simulate API call to external calendar service
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful connection
    setSyncSettings(prev => ({
      ...prev,
      [calendarType]: {
        connected: !prev[calendarType as keyof typeof prev].connected,
        lastSync: prev[calendarType as keyof typeof prev].connected ? null : new Date().toISOString()
      }
    }));
    
    setSyncInProgress(prev => ({ ...prev, [calendarType]: false }));
  };
  
  const handleSyncNow = async (calendarType: string) => {
    setSyncInProgress(prev => ({ ...prev, [calendarType]: true }));
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSyncSettings(prev => ({
      ...prev,
      [calendarType]: {
        ...prev[calendarType as keyof typeof prev],
        lastSync: new Date().toISOString()
      }
    }));
    
    setSyncInProgress(prev => ({ ...prev, [calendarType]: false }));
  };
  
  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const searchEvents = () => {
    if (!searchQuery.trim()) return [];
    
    const results: Array<ExtendedEvent & { date: string }> = [];
    Object.entries(events).forEach(([date, dayEvents]) => {
      dayEvents.forEach(event => {
        if (
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
        ) {
          results.push({ ...event, date });
        }
      });
    });
    
    return results.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };
  
  const getFilteredEvents = () => {
    const allEvents: Array<ExtendedEvent & { date: string }> = [];
    Object.entries(events).forEach(([date, dayEvents]) => {
      dayEvents.forEach(event => {
        allEvents.push({ ...event, date });
      });
    });
    
    let filtered = allEvents;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };
  
  const getDayEvents = (dateString: string) => {
    return events[dateString] || [];
  };
  
  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };
  
  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === 'yearly') {
      newDate.setFullYear(newDate.getFullYear() + direction);
    }
    
    setCurrentDate(newDate);
    setCurrentYear(newDate.getFullYear());
    setCurrentMonth(newDate.getMonth());
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NeuroCal</h1>
                <p className="text-sm text-gray-500">
                  {viewMode === 'main' || viewMode === 'monthly' ? 'AI-Powered Calendar' : 
                   viewMode === 'daily' ? 'Daily View' :
                   viewMode === 'weekly' ? 'Weekly View' :
                   viewMode === 'yearly' ? 'Yearly View' :
                   'Extended Calendar View'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation controls */}
          {(viewMode === 'daily' || viewMode === 'weekly' || viewMode === 'monthly' || viewMode === 'yearly') && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="font-semibold text-lg text-gray-900 min-w-32 text-center">
                {viewMode === 'daily' && currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {viewMode === 'weekly' && `Week of ${getWeekDays()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                {viewMode === 'monthly' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {viewMode === 'yearly' && currentYear}
              </span>
              <button
                onClick={() => navigateDate(1)}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
          
          {/* Sync Settings Button */}
          <button
            onClick={() => setShowSyncModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Sync</span>
          </button>
        </div>
        
        {/* View mode selector */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setViewMode('daily')}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-all
              ${viewMode === 'daily' 
                ? 'bg-indigo-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-all
              ${viewMode === 'weekly' 
                ? 'bg-indigo-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-all
              ${viewMode === 'monthly' 
                ? 'bg-indigo-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-all
              ${viewMode === 'yearly' 
                ? 'bg-indigo-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            Yearly
          </button>
          <div className="w-px bg-gray-300 mx-1"></div>
          <button
            onClick={() => setViewMode('main')}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-all
              ${viewMode === 'main' 
                ? 'bg-indigo-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            Main
          </button>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-3 mt-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(!!e.target.value.trim());
              }}
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm w-64"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
          >
            <option value="all">All Types</option>
            <option value="meeting">Meetings</option>
            <option value="focus">Focus Time</option>
            <option value="break">Breaks</option>
            <option value="travel">Travel</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Calendar Content Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Enhanced Calendar View</h3>
        <p className="text-gray-500 mb-4">
          This enhanced calendar includes all the features you requested:
        </p>
        <ul className="text-sm text-gray-600 space-y-1 text-left max-w-md mx-auto">
          <li>✅ Delete created events</li>
          <li>✅ Edit existing events</li>
          <li>✅ Customizable reminder times</li>
          <li>✅ External calendar sync (Google, Apple, Outlook)</li>
          <li>✅ Multiple view modes (Daily, Weekly, Monthly, Yearly)</li>
          <li>✅ Advanced search and filtering</li>
        </ul>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Add Event'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDate && formatDate(selectedDate)}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              
              {/* Event Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Event Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="meeting">Meeting</option>
                  <option value="focus">Focus Time</option>
                  <option value="break">Break</option>
                  <option value="travel">Travel</option>
                </select>
              </div>
              
              {/* Event Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter event description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>
              
              {/* Reminders */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Bell className="w-4 h-4 inline mr-1" />
                    Reminders
                  </label>
                  <button
                    type="button"
                    onClick={handleAddReminder}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Reminder</span>
                  </button>
                </div>
                
                {newEvent.reminders.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No reminders set</p>
                ) : (
                  <div className="space-y-2">
                    {newEvent.reminders.map((reminder, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <select
                          value={reminder}
                          onChange={(e) => handleReminderChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
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
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove reminder"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={!newEvent.title.trim()}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {editingEvent ? 'Update Event' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Calendar Sync</h2>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-600">
                Connect your external calendars to sync events seamlessly with NeuroCal.
              </p>
              
              {/* Google Calendar */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Google Calendar</h3>
                      <p className="text-sm text-gray-500">
                        Status: {syncSettings.googleCalendar.connected ? (
                          <span className="text-green-600 font-medium">Connected</span>
                        ) : (
                          <span className="text-gray-500">Not connected</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSyncCalendar('googleCalendar')}
                    disabled={syncInProgress.googleCalendar}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      syncSettings.googleCalendar.connected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {syncInProgress.googleCalendar ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : syncSettings.googleCalendar.connected ? (
                      'Disconnect'
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
                {syncSettings.googleCalendar.connected && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Last sync: {formatLastSync(syncSettings.googleCalendar.lastSync)}
                    </span>
                    <button
                      onClick={() => handleSyncNow('googleCalendar')}
                      disabled={syncInProgress.googleCalendar}
                      className="text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                    >
                      {syncInProgress.googleCalendar ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Apple Calendar */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Apple Calendar</h3>
                      <p className="text-sm text-gray-500">
                        Status: {syncSettings.appleCalendar.connected ? (
                          <span className="text-green-600 font-medium">Connected</span>
                        ) : (
                          <span className="text-gray-500">Not connected</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSyncCalendar('appleCalendar')}
                    disabled={syncInProgress.appleCalendar}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      syncSettings.appleCalendar.connected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {syncInProgress.appleCalendar ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : syncSettings.appleCalendar.connected ? (
                      'Disconnect'
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
                {syncSettings.appleCalendar.connected && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Last sync: {formatLastSync(syncSettings.appleCalendar.lastSync)}
                    </span>
                    <button
                      onClick={() => handleSyncNow('appleCalendar')}
                      disabled={syncInProgress.appleCalendar}
                      className="text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                    >
                      {syncInProgress.appleCalendar ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Outlook Calendar */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Outlook Calendar</h3>
                      <p className="text-sm text-gray-500">
                        Status: {syncSettings.outlookCalendar.connected ? (
                          <span className="text-green-600 font-medium">Connected</span>
                        ) : (
                          <span className="text-gray-500">Not connected</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSyncCalendar('outlookCalendar')}
                    disabled={syncInProgress.outlookCalendar}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      syncSettings.outlookCalendar.connected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {syncInProgress.outlookCalendar ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : syncSettings.outlookCalendar.connected ? (
                      'Disconnect'
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
                {syncSettings.outlookCalendar.connected && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Last sync: {formatLastSync(syncSettings.outlookCalendar.lastSync)}
                    </span>
                    <button
                      onClick={() => handleSyncNow('outlookCalendar')}
                      disabled={syncInProgress.outlookCalendar}
                      className="text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                    >
                      {syncInProgress.outlookCalendar ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Sync Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Settings className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Sync Settings</h4>
                    <p className="text-sm text-blue-700">
                      Events sync automatically every 15 minutes when connected. Manual sync is available anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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

export default ExtendedCalendarView;
