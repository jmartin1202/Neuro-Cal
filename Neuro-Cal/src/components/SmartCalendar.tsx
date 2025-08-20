import React, { useState } from 'react';

const SmartCalendar = () => {
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

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    
    return (
      <div className="bg-white rounded-lg">
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
          {daysOfWeek.map(day => (
            <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, index) => (
            <div
              key={index}
              className={`bg-white p-4 min-h-24 ${
                !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
              } hover:bg-gray-50 cursor-pointer`}
            >
              <div className="font-medium">{day.date}</div>
              {day.isCurrentMonth && (
                <div className="text-xs text-gray-400 mt-2">Click to add event</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          <div className="bg-gray-50 p-3"></div>
          {weekDays.map((day, index) => (
            <div key={index} className="bg-gray-50 p-3 text-center">
              <div className="text-sm font-medium text-gray-700">
                {daysOfWeek[day.getDay()]}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-px bg-gray-200 max-h-96 overflow-y-auto">
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="bg-white p-2 text-xs text-gray-500 border-r">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              {weekDays.map((_, dayIndex) => (
                <div
                  key={`${hour}-${dayIndex}`}
                  className="bg-white p-2 min-h-12 hover:bg-gray-50 cursor-pointer border-r border-b border-gray-100"
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
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">
              {daysOfWeek[today.getDay()]}
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {today.getDate()}
            </div>
            <div className="text-sm text-gray-500">
              {monthNames[today.getMonth()]} {today.getFullYear()}
            </div>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-gray-100">
              <div className="w-20 p-3 text-xs text-gray-500 bg-gray-50">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="flex-1 p-3 min-h-16 hover:bg-gray-50 cursor-pointer">
                <div className="text-xs text-gray-400">Click to add event</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-6">



      {/* Calendar Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs">📅</span>
            </div>
          </div>
          
          {/* Navigation and View Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <h3 className="text-lg font-medium text-gray-900 min-w-32 text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['Month', 'Week', 'Day'].map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === view
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Calendar Content */}
        <div className="p-4">
          {currentView === 'Month' && renderMonthView()}
          {currentView === 'Week' && renderWeekView()}
          {currentView === 'Day' && renderDayView()}
        </div>
      </div>
    </div>
  );
};

export default SmartCalendar;