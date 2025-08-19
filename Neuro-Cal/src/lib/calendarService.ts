import { supabaseTyped, Database } from './supabase'
import { User } from '@supabase/supabase-js'

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert']
type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update']

export class CalendarService {
  private user: User

  constructor(user: User) {
    this.user = user
  }

  // Get all events for a user
  async getEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    let query = supabaseTyped
      .from('calendar_events')
      .select('*')
      .eq('user_id', this.user.id)
      .order('start_time', { ascending: true })

    if (startDate) {
      query = query.gte('start_time', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('end_time', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      throw new Error('Failed to fetch events')
    }

    return data || []
  }

  // Get a single event by ID
  async getEvent(eventId: string): Promise<CalendarEvent | null> {
    const { data, error } = await supabaseTyped
      .from('calendar_events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', this.user.id)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      return null
    }

    return data
  }

  // Create a new event
  async createEvent(event: Omit<CalendarEventInsert, 'user_id'>): Promise<CalendarEvent> {
    const { data, error } = await supabaseTyped
      .from('calendar_events')
      .insert([{ ...event, user_id: this.user.id }])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      throw new Error('Failed to create event')
    }

    return data
  }

  // Update an existing event
  async updateEvent(eventId: string, updates: CalendarEventUpdate): Promise<CalendarEvent> {
    const { data, error } = await supabaseTyped
      .from('calendar_events')
      .update(updates)
      .eq('id', eventId)
      .eq('user_id', this.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      throw new Error('Failed to update event')
    }

    return data
  }

  // Delete an event
  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabaseTyped
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', this.user.id)

    if (error) {
      console.error('Error deleting event:', error)
      throw new Error('Failed to delete event')
    }
  }

  // Get events for a specific date range
  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const { data, error } = await supabaseTyped
      .from('calendar_events')
      .select('*')
      .eq('user_id', this.user.id)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching events by date range:', error)
      throw new Error('Failed to fetch events')
    }

    return data || []
  }

  // Get recurring events
  async getRecurringEvents(): Promise<CalendarEvent[]> {
    const { data, error } = await supabaseTyped
      .from('calendar_events')
      .select('*')
      .eq('user_id', this.user.id)
      .eq('is_recurring', true)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching recurring events:', error)
      throw new Error('Failed to fetch recurring events')
    }

    return data || []
  }

  // Search events by title or description
  async searchEvents(query: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabaseTyped
      .from('calendar_events')
      .select('*')
      .eq('user_id', this.user.id)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error searching events:', error)
      throw new Error('Failed to search events')
    }

    return data || []
  }

  // Get events by location
  async getEventsByLocation(location: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabaseTyped
      .from('calendar_events')
      .select('*')
      .eq('user_id', this.user.id)
      .ilike('location', `%${location}%`)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching events by location:', error)
      throw new Error('Failed to fetch events by location')
    }

    return data || []
  }

  // Subscribe to real-time updates
  subscribeToEvents(callback: (payload: any) => void) {
    return supabaseTyped
      .channel('calendar_events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `user_id=eq.${this.user.id}`
        },
        callback
      )
      .subscribe()
  }
}

// Factory function to create calendar service
export const createCalendarService = (user: User) => new CalendarService(user)
