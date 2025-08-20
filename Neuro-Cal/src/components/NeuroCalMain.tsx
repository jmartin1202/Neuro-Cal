import React, { useState } from 'react';
import { Calendar, Clock, X, Plus, Settings, Users, Bell, Lock, Palette, Globe, Database, UserPlus, Mail, Phone, Building, Filter, Search, Edit, Trash2 } from 'lucide-react';

const NeuroCalMain = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [events, setEvents] = useState({});
  const [contacts, setContacts] = useState([
    { id: 1, name: 'John Smith', email: 'john@company.com', phone: '+1-555-0123', company: 'Tech Corp', status: 'Active', lastContact: '2025-08-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@startup.io', phone: '+1-555-0124', company: 'StartupIO', status: 'Lead', lastContact: '2025-08-18' },
    { id: 3, name: 'Mike Davis', email: 'mike@agency.com', phone: '+1-555-0125', company: 'Design Agency', status: 'Client', lastContact: '2025-08-10' }
  ]);
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
  const [eventForm, setEventForm] = useState({
    title: '',
    time: '',
    description: '',
    type: 'meeting'
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Lead'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const currentMonth = 7; // August (0-indexed)
  const currentYear = 2025;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const eventTypes = {
    meeting: 'bg-blue-500',
    personal: 'bg-green-500',
    reminder: 'bg-yellow-500',
    deadline: 'bg-red-500'
  };

  // Calendar Functions
  const handleDateClick = (day) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate({ day, dateKey });
    setShowEventModal(true);
  };

  const handleEventSubmit = () => {
    if (!eventForm.title.trim()) return;

    const newEvent = {
      ...eventForm,
      id: Date.now()
    };

    setEvents(prev => ({
      ...prev,
      [selectedDate.dateKey]: [...(prev[selectedDate.dateKey] || []), newEvent]
    }));

    setEventForm({ title: '', time: '', description: '', type: 'meeting' });
    setShowEventModal(false);
    setSelectedDate(null);
  };

  const deleteEvent = (dateKey, eventId) => {
    setEvents(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(event => event.id !== eventId)
    }));
  };

  // CRM Functions
  const handleContactSubmit = () => {
    if (!contactForm.name.trim() || !contactForm.email.trim()) return;

    if (editingContact) {
      setContacts(prev => prev.map(contact => 
        contact.id === editingContact.id 
          ? { ...contactForm, id: editingContact.id, lastContact: new Date().toISOString().split('T')[0] }
          : contact
      ));
      setEditingContact(null);
    } else {
      const newContact = {
        ...contactForm,
        id: Date.now(),
        lastContact: new Date().toISOString().split('T')[0]
      };
      setContacts(prev => [...prev, newContact]);
    }

    setContactForm({ name: '', email: '', phone: '', company: '', status: 'Lead' });
    setShowContactModal(false);
  };

  const editContact = (contact) => {
    setContactForm(contact);
    setEditingContact(contact);
    setShowContactModal(true);
  };

  const deleteContact = (contactId) => {
    setContacts(prev => prev.filter(contact => contact.id !== contactId));
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Settings Functions
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Previous month's trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevMonthDay = new Date(currentYear, currentMonth, -i).getDate();
      days.push(
        <div key={`prev-${prevMonthDay}`} className="h-20 p-1 text-gray-400 cursor-pointer hover:bg-gray-50">
          <div className="text-sm">{prevMonthDay}</div>
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events[dateKey] || [];
      const isToday = day === 20;

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-20 p-1 border-l border-b cursor-pointer hover:bg-blue-50 transition-colors ${
            isToday ? 'bg-blue-100 border-blue-300' : ''
          }`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded text-white truncate ${eventTypes[event.type]}`}
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

    return days;
  };

  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">August 2025</h2>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Today
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-indigo-600">
          {weekdays.map(day => (
            <div key={day} className="p-3 text-center text-white font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );

  const renderCRM = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Contact Management</h2>
        <button
          onClick={() => setShowContactModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <UserPlus size={16} />
          Add Contact
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Status</option>
          <option value="Lead">Lead</option>
          <option value="Client">Client</option>
          <option value="Active">Active</option>
        </select>
      </div>

      {/* Contacts Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Company</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Last Contact</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredContacts.map(contact => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{contact.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{contact.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{contact.company}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    contact.status === 'Active' ? 'bg-green-100 text-green-800' :
                    contact.status === 'Client' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {contact.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{contact.lastContact}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => editContact(contact)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Settings</h2>

      {/* Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={20} className="text-indigo-600" />
          <h3 className="text-lg font-medium">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Push Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => updateSetting('notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Email Reminders</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailReminders}
                onChange={(e) => updateSetting('emailReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette size={20} className="text-indigo-600" />
          <h3 className="text-lg font-medium">Appearance</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Dark Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => updateSetting('darkMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Week Starts On</label>
            <select
              value={settings.weekStart}
              onChange={(e) => updateSetting('weekStart', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
            </select>
          </div>
        </div>
      </div>

      {/* Regional */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe size={20} className="text-indigo-600" />
          <h3 className="text-lg font-medium">Regional Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Time Zone</label>
            <select
              value={settings.timeZone}
              onChange={(e) => updateSetting('timeZone', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="UTC-8">Pacific Time (UTC-8)</option>
              <option value="UTC-7">Mountain Time (UTC-7)</option>
              <option value="UTC-6">Central Time (UTC-6)</option>
              <option value="UTC-5">Eastern Time (UTC-5)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={20} className="text-indigo-600" />
          <h3 className="text-lg font-medium">Calendar Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Auto-sync Events</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSync}
                onChange={(e) => updateSetting('autoSync', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Default Meeting Length (minutes)</label>
            <select
              value={settings.defaultMeetingLength}
              onChange={(e) => updateSetting('defaultMeetingLength', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <Calendar size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NeuroCal</h1>
              <p className="text-gray-500">AI-Powered Calendar</p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar size={16} />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'crm' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={16} />
              CRM
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'crm' && renderCRM()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Add Event - August {selectedDate?.day}, 2025
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="meeting">Meeting</option>
                  <option value="personal">Personal</option>
                  <option value="reminder">Reminder</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEventSubmit}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add Event
                </button>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>

            {selectedDate && events[selectedDate.dateKey] && events[selectedDate.dateKey].length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Events:</h4>
                <div className="space-y-2">
                  {events[selectedDate.dateKey].map(event => (
                    <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{event.title}</div>
                        {event.time && <div className="text-xs text-gray-500">{event.time}</div>}
                      </div>
                      <button
                        onClick={() => deleteEvent(selectedDate.dateKey, event.id)}
                        className="text-red-500 hover:text-red-700"
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

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setEditingContact(null);
                  setContactForm({ name: '', email: '', phone: '', company: '', status: 'Lead' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={contactForm.status}
                  onChange={(e) => setContactForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Lead">Lead</option>
                  <option value="Client">Client</option>
                  <option value="Active">Active</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleContactSubmit}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  {editingContact ? <Edit size={16} /> : <UserPlus size={16} />}
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setEditingContact(null);
                    setContactForm({ name: '', email: '', phone: '', company: '', status: 'Lead' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuroCalMain;
