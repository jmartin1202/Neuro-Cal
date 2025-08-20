import React, { useState } from 'react';
import { Event } from './EventCard';

interface SmartCalendarProps {
  events?: Event[];
}

const SmartCalendar = ({ events = [] }: SmartCalendarProps) => {
  const [currentView, setCurrentView] = useState('Month');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7)); // August 2025

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        isPrevMonth: false
      });
    }
    
    // Next month's leading days
    const totalCells = 42; // 6 rows × 7 days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isPrevMonth: false
      });
    }
    
    return days;
  };

  const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const getEventsForDate = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    
    return (
      <div className="calendar-grid">
        {daysOfWeek.map(day => (
          <div key={day} className="calendar-header">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-cell ${
              !day.isCurrentMonth ? 'other-month' : ''
            } ${isToday(day.date) ? 'today' : ''}`}
          >
            <div className="cell-date">{day.date}</div>
            <div className="cell-content">
              <span className="add-event-text">Click to add event</span>
            </div>
            {/* Show actual events for this date */}
            {day.isCurrentMonth && getEventsForDate(day.date).map((event, eventIndex) => (
              <div key={eventIndex} className="event-dots">
                <div 
                  className="event-dot" 
                  style={{ backgroundColor: event.color }}
                  title={`${event.title} at ${event.time}`}
                ></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="bg-white rounded-lg overflow-hidden border border-border">
        <div className="grid grid-cols-8 gap-px bg-border">
          <div className="bg-muted p-2 md:p-3"></div>
          {weekDays.map((day, index) => (
            <div key={index} className="bg-muted p-2 md:p-3 text-center">
              <div className="text-xs md:text-sm font-medium text-muted-foreground">
                {daysOfWeek[day.getDay()]}
              </div>
              <div className="text-sm md:text-lg font-semibold text-foreground">
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-px bg-border max-h-96 overflow-y-auto">
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="bg-white p-2 text-xs text-muted-foreground border-r border-border">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              {weekDays.map((_, dayIndex) => (
                <div
                  key={`${hour}-${dayIndex}`}
                  className="bg-white p-2 min-h-10 md:min-h-12 hover:bg-warm-light cursor-pointer border-r border-b border-border touch-target"
                >
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const today = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="bg-white rounded-lg overflow-hidden border border-border">
        <div className="p-3 md:p-4 bg-muted border-b border-border">
          <div className="text-center">
            <div className="text-xs md:text-sm font-medium text-muted-foreground">
              {daysOfWeek[today.getDay()]}
            </div>
            <div className="text-xl md:text-2xl font-semibold text-foreground">
              {today.getDate()}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              {monthNames[today.getMonth()]} {today.getFullYear()}
            </div>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-border">
              <div className="w-16 md:w-20 p-2 md:p-3 text-xs text-muted-foreground bg-muted">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="flex-1 p-2 md:p-3 min-h-12 md:min-h-16 hover:bg-warm-light cursor-pointer touch-target">
                <div className="text-xs text-muted-foreground">Click to add event</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Calendar Navigation */}
      <div className="calendar-nav">
        <div className="nav-controls">
          <button
            onClick={() => navigateMonth(-1)}
            className="nav-btn"
          >
            ‹
          </button>
          <h2 className="month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="nav-btn"
          >
            ›
          </button>
        </div>
        
        {/* View Toggle Buttons */}
        <div className="view-controls">
          {['Month', 'Week', 'Day'].map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`view-btn ${
                currentView === view ? 'active' : ''
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>
      
      {/* Calendar Content */}
      <div>
        {currentView === 'Month' && renderMonthView()}
        {currentView === 'Week' && renderWeekView()}
        {currentView === 'Day' && renderDayView()}
      </div>
    </div>
  );
};

export default SmartCalendar;