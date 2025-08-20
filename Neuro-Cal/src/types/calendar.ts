// Calendar-specific types
export interface CalendarView {
  type: 'day' | 'week' | 'month' | 'year' | 'agenda';
  startDate: Date;
  endDate: Date;
  currentDate: Date;
}

export interface CalendarGrid {
  rows: CalendarRow[];
  columns: CalendarColumn[];
  cells: CalendarCell[][];
}

export interface CalendarRow {
  id: string;
  time?: string;
  date?: Date;
  events: Event[];
}

export interface CalendarColumn {
  id: string;
  date: Date;
  dayOfWeek: string;
  isToday: boolean;
  isWeekend: boolean;
  isWorkingDay: boolean;
}

export interface CalendarCell {
  id: string;
  rowId: string;
  columnId: string;
  date: Date;
  time?: string;
  events: Event[];
  isCurrentTime: boolean;
  isSelected: boolean;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  duration: number; // minutes
  isAvailable: boolean;
  conflictingEvents: Event[];
}

export interface CalendarSettings {
  defaultView: 'day' | 'week' | 'month';
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  showWeekends: boolean;
  showWorkingHoursOnly: boolean;
  timeSlotDuration: number; // minutes
  maxEventsPerSlot: number;
  eventOverlapThreshold: number; // minutes
}

export interface CalendarNavigation {
  goToDate: (date: Date) => void;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToView: (view: CalendarView['type']) => void;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  description?: string;
  color?: string;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  attendees: Attendee[];
  reminders: Reminder[];
  category: EventCategory;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

export interface Reminder {
  id: string;
  type: 'email' | 'push' | 'sms' | 'popup';
  time: Date;
  isSent: boolean;
  sentAt?: Date;
}

export interface CalendarFilter {
  categories: string[];
  priorities: string[];
  statuses: string[];
  attendees: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  searchText: string;
}

export interface CalendarExport {
  format: 'ics' | 'csv' | 'json' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeDetails: boolean;
  includeAttendees: boolean;
  includeReminders: boolean;
}

export interface CalendarImport {
  format: 'ics' | 'csv' | 'json';
  file: File;
  options: {
    createNewEvents: boolean;
    updateExistingEvents: boolean;
    importAttendees: boolean;
    importReminders: boolean;
    defaultCategory: string;
  };
}

export interface CalendarStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  averageEventDuration: number;
  mostActiveDay: string;
  mostActiveHour: number;
  categoryBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
}
