import React, { useState, useCallback } from 'react';
import { Calendar, Clock, X, Plus } from 'lucide-react';
import { Event } from './EventCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface InteractiveCalendarProps {
  events: Event[];
  onCreateEvent: (event: Omit<Event, 'id'>) => void;
  onDeleteEvent?: (eventId: string) => void;
  currentDate?: Date;
  onMonthChange?: (date: Date) => void;
  viewMode?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const InteractiveCalendar = ({ 
  events, 
  onCreateEvent, 
  onDeleteEvent,
  currentDate = new Date(),
  onMonthChange,
  viewMode = 'monthly'
}: InteractiveCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<{ day: number; dateKey: string } | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [localCurrentDate, setLocalCurrentDate] = useState(currentDate);
  const [eventForm, setEventForm] = useState({
    title: '',
    time: '09:00',
    duration: '1 hour',
    location: '',
    description: '',
    type: 'meeting' as const
  });

  const currentMonth = localCurrentDate.getMonth();
  const currentYear = localCurrentDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const eventTypes = {
    meeting: 'bg-calendar-event',
    focus: 'bg-primary',
    break: 'bg-accent',
    travel: 'bg-destructive'
  };

  const getEventColor = (type: Event['type']) => {
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
  };

  // Daily View Functions
  const renderDailyView = () => {
    const today = new Date(localCurrentDate);
    const dayEvents = events.filter(event => 
      event.date && event.date.toDateString() === today.toDateString()
    ).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    return (
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {today.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>
        
        <div className="space-y-3">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No events scheduled for today</p>
              <p className="text-sm">Click on a date to add an event</p>
            </div>
          ) : (
            dayEvents.map(event => (
              <div key={event.id} className="flex items-center p-3 bg-card border border-border rounded-lg">
                <div className={`w-3 h-3 rounded-full mr-3 ${getEventColor(event.type)}`}></div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{event.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {event.time && `${event.time} • `}{event.duration}
                    {event.location && ` • 📍 ${event.location}`}
                  </div>
                </div>
                {onDeleteEvent && (
                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="text-destructive hover:text-destructive/80 p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Weekly View Functions
  const renderWeeklyView = () => {
    const startOfWeek = new Date(localCurrentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Week of {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h3>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const dayEvents = events.filter(event => 
              event.date && event.date.toDateString() === date.toDateString()
            );
            
            return (
              <div key={index} className="min-h-[120px] p-2 border border-border rounded-lg">
                <div className="text-center mb-2">
                  <div className="text-sm font-medium text-foreground">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${
                    date.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-foreground'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div key={event.id} className={`text-xs p-1 rounded ${getEventColor(event.type)} text-white`}>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Yearly View Functions
  const renderYearlyView = () => {
    const year = localCurrentDate.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(year, month, 1);
      const monthEvents = events.filter(event => 
        event.date && event.date.getFullYear() === year && event.date.getMonth() === month
      );
      
      months.push({ month: month, date: monthDate, events: monthEvents });
    }

    return (
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{year}</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {months.map(({ month, date, events: monthEvents }) => (
            <div key={month} className="border border-border rounded-lg p-3">
              <div className="text-center mb-2">
                <h4 className="font-medium text-foreground">
                  {date.toLocaleDateString('en-US', { month: 'long' })}
                </h4>
                <div className="text-sm text-muted-foreground">
                  {monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="space-y-1">
                {monthEvents.slice(0, 3).map(event => (
                  <div key={event.id} className={`text-xs p-1 rounded ${getEventColor(event.type)} text-white truncate`}>
                    {event.title}
                  </div>
                ))}
                {monthEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{monthEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const navigateDate = useCallback((direction: number) => {
    const newDate = new Date(localCurrentDate);
    
    switch (viewMode) {
      case 'daily':
        newDate.setDate(localCurrentDate.getDate() + direction);
        break;
      case 'weekly':
        newDate.setDate(localCurrentDate.getDate() + (direction * 7));
        break;
      case 'monthly':
        newDate.setMonth(localCurrentDate.getMonth() + direction);
        break;
      case 'yearly':
        newDate.setFullYear(localCurrentDate.getFullYear() + direction);
        break;
    }
    
    setLocalCurrentDate(newDate);
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  }, [localCurrentDate, onMonthChange, viewMode]);

  const handleDateClick = useCallback((day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate({ day, dateKey });
    setShowEventModal(true);
  }, [currentYear, currentMonth]);

  const handleEventSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !selectedDate) return;

    const newEvent: Omit<Event, 'id'> = {
      title: eventForm.title,
      time: eventForm.time,
      duration: eventForm.duration,
      date: new Date(currentYear, currentMonth, selectedDate.day),
      location: eventForm.location || undefined,
      attendees: undefined,
      color: getEventColor(eventForm.type),
      type: eventForm.type
    };

    onCreateEvent(newEvent);
    
    setEventForm({ title: '', time: '09:00', duration: '1 hour', location: '', description: '', type: 'meeting' });
    setShowEventModal(false);
    setSelectedDate(null);
  }, [eventForm, selectedDate, currentYear, currentMonth, onCreateEvent]);

  const closeModal = useCallback(() => {
    setShowEventModal(false);
    setSelectedDate(null);
    setEventForm({ title: '', time: '09:00', duration: '1 hour', location: '', description: '', type: 'meeting' });
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    if (onDeleteEvent) {
      onDeleteEvent(eventId);
    }
  }, [onDeleteEvent]);

  const getEventsForDate = useCallback((dateKey: string) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const eventDateKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return eventDateKey === dateKey;
    });
  }, [events]);

  const renderCalendarDays = useCallback(() => {
    const days = [];
    const totalCells = 42; // 6 weeks × 7 days

    // Previous month's trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevMonthDay = new Date(currentYear, currentMonth, -i).getDate();
      days.push(
        <div key={`prev-${prevMonthDay}`} className="h-20 p-1 text-muted-foreground cursor-pointer hover:bg-muted">
          <div className="text-sm">{prevMonthDay}</div>
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateKey);
      const today = new Date();
      const isToday = day === today.getDate() && 
                     currentMonth === today.getMonth() && 
                     currentYear === today.getFullYear();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-20 p-1 border-l border-b cursor-pointer hover:bg-muted transition-colors ${
            isToday ? 'bg-calendar-today/20 border-calendar-today' : ''
          }`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-calendar-today font-bold' : 'text-foreground'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded text-white truncate ${getEventColor(event.type)}`}
              >
                {event.time && `${event.time} `}{event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    // Next month's leading days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="h-20 p-1 text-muted-foreground cursor-pointer hover:bg-muted">
          <div className="text-sm">{day}</div>
        </div>
      );
    }

    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfMonth, currentDate, getEventsForDate, handleDateClick]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">NeuroCal</h1>
            <p className="text-muted-foreground">AI-Powered Calendar</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateDate(-1)}
            className="w-8 h-8 border border-border bg-card rounded-md flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out text-muted-foreground hover:bg-muted"
          >
            ‹
          </button>
          <h2 className="text-xl font-semibold text-foreground">
            {viewMode === 'daily' && localCurrentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            {viewMode === 'weekly' && `Week of ${(() => {
              const startOfWeek = new Date(localCurrentDate);
              const dayOfWeek = startOfWeek.getDay();
              startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
              return startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            })()} - ${(() => {
              const startOfWeek = new Date(localCurrentDate);
              const dayOfWeek = startOfWeek.getDay();
              startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              return endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            })()}`}
            {viewMode === 'monthly' && `${monthNames[currentMonth]} ${currentYear}`}
            {viewMode === 'yearly' && `${currentYear}`}
          </h2>
          <button
            onClick={() => navigateDate(1)}
            className="w-8 h-8 border border-border bg-card rounded-md flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out text-muted-foreground hover:bg-muted"
          >
            ›
          </button>
          <button
            onClick={() => {
              const today = new Date();
              setLocalCurrentDate(today);
              if (onMonthChange) {
                onMonthChange(today);
              }
            }}
            className="px-3 py-1 text-sm border border-border bg-card rounded-md cursor-pointer transition-all duration-150 ease-in-out text-muted-foreground hover:bg-muted"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      {viewMode === 'daily' && renderDailyView()}
      {viewMode === 'weekly' && renderWeeklyView()}
      {viewMode === 'monthly' && (
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Week headers */}
          <div className="grid grid-cols-7 bg-primary">
            {weekdays.map(day => (
              <div key={day} className="p-3 text-center text-primary-foreground font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {renderCalendarDays()}
          </div>
        </div>
      )}
      {viewMode === 'yearly' && renderYearlyView()}

      {/* Event Input Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-96 max-w-90vw max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">
                Add Event - {monthNames[currentMonth]} {selectedDate.day}, {currentYear}
              </h3>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                  Event Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="time" className="block text-sm font-medium text-foreground mb-1">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="block text-sm font-medium text-foreground mb-1">
                  Duration
                </Label>
                <Select
                  value={eventForm.duration}
                  onValueChange={(value) => setEventForm(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15 minutes">15 minutes</SelectItem>
                    <SelectItem value="30 minutes">30 minutes</SelectItem>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                    <SelectItem value="2 hours">2 hours</SelectItem>
                    <SelectItem value="3 hours">3 hours</SelectItem>
                    <SelectItem value="4 hours">4 hours</SelectItem>
                    <SelectItem value="All day">All day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
                  Event Type
                </Label>
                <Select
                  value={eventForm.type}
                  onValueChange={(value: Event['type']) => setEventForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="focus">Focus Time</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full"
                  placeholder="Optional location"
                />
              </div>

              <div>
                <Label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add Event
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
              </div>
            </form>

            {/* Show existing events for this date */}
            {selectedDate && getEventsForDate(selectedDate.dateKey).length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">Existing Events:</h4>
                <div className="space-y-2">
                  {getEventsForDate(selectedDate.dateKey).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium text-sm text-foreground">{event.title}</div>
                        {event.time && <div className="text-xs text-muted-foreground">{event.time}</div>}
                      </div>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
        <h3 className="font-medium text-foreground mb-2">How to use:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Click on any date to add an event</li>
          <li>• Events are color-coded by type (Meeting: purple, Focus: green, etc.)</li>
          <li>• Up to 2 events show on each date, with "+more" indicator for additional events</li>
          <li>• Click the X next to existing events to delete them</li>
        </ul>
      </div>
    </div>
  );
};

export default InteractiveCalendar;
