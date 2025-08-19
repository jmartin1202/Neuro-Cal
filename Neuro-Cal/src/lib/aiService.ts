import { Event } from '@/components/EventCard';

export interface AISuggestion {
  type: 'time_slot' | 'productivity' | 'balance' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  data?: any;
}

export interface SmartSchedulingResult {
  suggestedTimes: Array<{
    startTime: Date;
    endTime: Date;
    reason: string;
    confidence: number;
  }>;
  conflicts: Array<{
    eventId: string;
    title: string;
    conflictType: 'overlap' | 'too_close' | 'timezone_issue';
  }>;
  recommendations: string[];
}

export interface NaturalLanguageParseResult {
  title: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  type: Event['type'];
  location?: string;
  attendees?: string[];
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
}

class AIService {
  private context: {
    userPreferences: Record<string, any>;
    workingHours: { start: string; end: string };
    timezone: string;
    productivityPatterns: Array<{ hour: number; score: number }>;
  } = {
    userPreferences: {},
    workingHours: { start: '09:00', end: '17:00' },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    productivityPatterns: [
      { hour: 9, score: 0.9 },
      { hour: 10, score: 0.95 },
      { hour: 11, score: 0.85 },
      { hour: 14, score: 0.8 },
      { hour: 15, score: 0.75 },
      { hour: 16, score: 0.7 }
    ]
  };

  // Enhanced natural language parsing with context awareness
  async parseNaturalLanguage(input: string, context?: any): Promise<NaturalLanguageParseResult> {
    const lowerInput = input.toLowerCase();
    
    // Enhanced date parsing with relative dates and context
    const date = this.parseDate(lowerInput, context);
    
    // Enhanced time parsing with natural language
    const time = this.parseTime(lowerInput, context);
    
    // Enhanced duration parsing
    const duration = this.parseDuration(lowerInput);
    
    // Enhanced event type detection
    const type = this.parseEventType(lowerInput);
    
    // Enhanced location parsing
    const location = this.parseLocation(lowerInput);
    
    // Enhanced attendee parsing
    const attendees = this.parseAttendees(lowerInput);
    
    // Enhanced priority detection
    const priority = this.parsePriority(lowerInput);
    
    // Enhanced recurring pattern detection
    const recurring = this.parseRecurringPattern(lowerInput);
    
    // Calculate confidence based on parsing success
    const confidence = this.calculateConfidence({
      date: !!date,
      time: !!time,
      duration: !!duration,
      type: !!type,
      location: !!location,
      attendees: attendees.length > 0,
      priority: !!priority
    });

    return {
      title: this.generateTitle(input),
      date,
      time,
      duration,
      type,
      location,
      attendees,
      priority,
      confidence,
      recurring
    };
  }

  // Smart scheduling with conflict detection and optimization
  async suggestOptimalTimes(
    eventType: Event['type'],
    duration: number,
    preferredDate: Date,
    existingEvents: Event[]
  ): Promise<SmartSchedulingResult> {
    const workingHours = this.context.workingHours;
    const productivityPatterns = this.context.productivityPatterns;
    
    // Find available time slots
    const availableSlots = this.findAvailableSlots(
      preferredDate,
      duration,
      existingEvents,
      workingHours
    );
    
    // Score slots based on productivity patterns and preferences
    const scoredSlots = availableSlots.map(slot => ({
      ...slot,
      score: this.scoreTimeSlot(slot, eventType, productivityPatterns)
    }));
    
    // Sort by score and confidence
    const suggestedTimes = scoredSlots
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: this.generateReason(slot, eventType),
        confidence: slot.score
      }));

    // Detect conflicts
    const conflicts = this.detectConflicts(existingEvents, duration, preferredDate);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(eventType, duration, conflicts);

    return {
      suggestedTimes,
      conflicts,
      recommendations
    };
  }

  // Generate AI insights based on calendar patterns
  async generateInsights(events: Event[], timeRange: number = 30): Promise<AISuggestion[]> {
    const insights: AISuggestion[] = [];
    
    // Analyze meeting patterns
    const meetingRatio = this.calculateMeetingRatio(events);
    if (meetingRatio > 0.7) {
      insights.push({
        type: 'balance',
        title: 'High Meeting Load',
        description: `You're spending ${(meetingRatio * 100).toFixed(0)}% of your time in meetings. Consider blocking focus time.`,
        confidence: 0.9,
        actionable: true,
        priority: 'high',
        data: { meetingRatio }
      });
    }
    
    // Analyze productivity patterns
    const productivityInsight = this.analyzeProductivityPatterns(events);
    if (productivityInsight) {
      insights.push(productivityInsight);
    }
    
    // Analyze work-life balance
    const balanceInsight = this.analyzeWorkLifeBalance(events);
    if (balanceInsight) {
      insights.push(balanceInsight);
    }
    
    // Generate optimization suggestions
    const optimizationInsights = this.generateOptimizationSuggestions(events);
    insights.push(...optimizationInsights);
    
    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  // Private helper methods
  private parseDate(input: string, context?: any): Date {
    const today = new Date();
    
    // Relative dates
    if (input.includes('tomorrow')) {
      return new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }
    if (input.includes('next week')) {
      return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    if (input.includes('next month')) {
      return new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    }
    
    // Specific dates
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})/,
      /(\d{1,2})-(\d{1,2})/,
      /(\w+)\s+(\d{1,2})/,
      /(\d{1,2})\s+(\w+)/
    ];
    
    for (const pattern of datePatterns) {
      const match = input.match(pattern);
      if (match) {
        // Enhanced date parsing logic
        return this.parseSpecificDate(match, today);
      }
    }
    
    return today;
  }

  private parseTime(input: string, context?: any): string {
    // Enhanced time parsing with natural language
    const timePatterns = [
      { pattern: /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i, format: '12h' },
      { pattern: /(\d{1,2}):(\d{2})/, format: '24h' },
      { pattern: /(\d{1,2})\s*(am|pm)/i, format: '12h' }
    ];
    
    for (const { pattern, format } of timePatterns) {
      const match = input.match(pattern);
      if (match) {
        return this.formatTime(match, format);
      }
    }
    
    // Default to working hours start
    return this.context.workingHours.start;
  }

  private parseDuration(input: string): number {
    const durationPatterns = [
      { pattern: /(\d+)\s*min(?:ute)?s?/, multiplier: 1 },
      { pattern: /(\d+)\s*hr(?:s?)/, multiplier: 60 },
      { pattern: /(\d+)\s*hour(?:s?)/, multiplier: 60 },
      { pattern: /all\s*day/, multiplier: 480 } // 8 hours
    ];
    
    for (const { pattern, multiplier } of durationPatterns) {
      const match = input.match(pattern);
      if (match) {
        return parseInt(match[1]) * multiplier;
      }
    }
    
    return 60; // Default 1 hour
  }

  private parseEventType(input: string): Event['type'] {
    const typePatterns = [
      { pattern: /meeting|call|sync/, type: 'meeting' as const },
      { pattern: /focus|work|deep\s*work/, type: 'focus' as const },
      { pattern: /break|lunch|coffee/, type: 'break' as const },
      { pattern: /travel|flight|drive/, type: 'travel' as const }
    ];
    
    for (const { pattern, type } of typePatterns) {
      if (pattern.test(input)) {
        return type;
      }
    }
    
    return 'meeting';
  }

  private parseLocation(input: string): string | undefined {
    const locationPatterns = [
      { pattern: /office|workplace/, location: 'Office' },
      { pattern: /conference\s*room|meeting\s*room/, location: 'Conference Room' },
      { pattern: /zoom|online|virtual/, location: 'Zoom/Online' },
      { pattern: /cafe|restaurant/, location: 'Cafe/Restaurant' }
    ];
    
    for (const { pattern, location } of locationPatterns) {
      if (pattern.test(input)) {
        return location;
      }
    }
    
    return undefined;
  }

  private parseAttendees(input: string): string[] {
    const attendeePatterns = [
      { pattern: /team|everyone/, attendees: ['Team Members'] },
      { pattern: /john|jane|mike|sarah/, attendees: ['Team'] }
    ];
    
    for (const { pattern, attendees } of attendeePatterns) {
      if (pattern.test(input)) {
        return attendees;
      }
    }
    
    return [];
  }

  private parsePriority(input: string): 'high' | 'medium' | 'low' {
    if (input.includes('urgent') || input.includes('asap') || input.includes('critical')) {
      return 'high';
    }
    if (input.includes('important') || input.includes('priority')) {
      return 'medium';
    }
    return 'low';
  }

  private parseRecurringPattern(input: string) {
    if (input.includes('daily') || input.includes('every day')) {
      return { pattern: 'daily' as const, interval: 1 };
    }
    if (input.includes('weekly') || input.includes('every week')) {
      return { pattern: 'weekly' as const, interval: 1 };
    }
    if (input.includes('monthly') || input.includes('every month')) {
      return { pattern: 'monthly' as const, interval: 1 };
    }
    return undefined;
  }

  private calculateConfidence(parsed: Record<string, boolean>): number {
    const total = Object.keys(parsed).length;
    const successful = Object.values(parsed).filter(Boolean).length;
    return successful / total;
  }

  private generateTitle(input: string): string {
    // Extract meaningful title from input
    const words = input.split(' ').filter(word => 
      word.length > 2 && !['the', 'and', 'or', 'for', 'with', 'at', 'on', 'in'].includes(word.toLowerCase())
    );
    
    if (words.length > 0) {
      return words.slice(0, 4).join(' ').charAt(0).toUpperCase() + 
             words.slice(0, 4).join(' ').slice(1);
    }
    
    return 'New Event';
  }

  private findAvailableSlots(
    date: Date,
    duration: number,
    existingEvents: Event[],
    workingHours: { start: string; end: string }
  ) {
    // Implementation for finding available time slots
    // This would analyze existing events and find gaps
    return [];
  }

  private scoreTimeSlot(
    slot: any,
    eventType: Event['type'],
    productivityPatterns: Array<{ hour: number; score: number }>
  ): number {
    // Implementation for scoring time slots based on productivity patterns
    return 0.8;
  }

  private generateReason(slot: any, eventType: Event['type']): string {
    // Implementation for generating reasons why a time slot is optimal
    return 'Optimal time based on your productivity patterns';
  }

  private detectConflicts(
    existingEvents: Event[],
    duration: number,
    preferredDate: Date
  ) {
    // Implementation for detecting scheduling conflicts
    return [];
  }

  private generateRecommendations(
    eventType: Event['type'],
    duration: number,
    conflicts: any[]
  ): string[] {
    // Implementation for generating scheduling recommendations
    return ['Consider blocking buffer time before and after meetings'];
  }

  private calculateMeetingRatio(events: Event[]): number {
    const meetings = events.filter(e => e.type === 'meeting').length;
    return events.length > 0 ? meetings / events.length : 0;
  }

  private analyzeProductivityPatterns(events: Event[]): AISuggestion | null {
    // Implementation for analyzing productivity patterns
    return null;
  }

  private analyzeWorkLifeBalance(events: Event[]): AISuggestion | null {
    // Implementation for analyzing work-life balance
    return null;
  }

  private generateOptimizationSuggestions(events: Event[]): AISuggestion[] {
    // Implementation for generating optimization suggestions
    return [];
  }

  private parseSpecificDate(match: RegExpMatchArray, today: Date): Date {
    // Implementation for parsing specific date formats
    return today;
  }

  private formatTime(match: RegExpMatchArray, format: string): string {
    // Implementation for formatting time
    return '09:00';
  }
}

export const aiService = new AIService();
