import { useState, useEffect, useCallback } from 'react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { createCalendarService, CalendarService } from '@/lib/calendarService'
import { Database } from '@/lib/supabase'

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']

export const useCalendar = () => {
  const { user } = useSupabaseAuth()
  const [calendarService, setCalendarService] = useState<CalendarService | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize calendar service when user changes
  useEffect(() => {
    if (user) {
      setCalendarService(createCalendarService(user))
    } else {
      setCalendarService(null)
      setEvents([])
    }
  }, [user])

  // Load events
  const loadEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!calendarService) return

    try {
      setLoading(true)
      setError(null)
      const fetchedEvents = await calendarService.getEvents(startDate, endDate)
      setEvents(fetchedEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [calendarService])

  // Create event
  const createEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!calendarService) throw new Error('User not authenticated')

    try {
      setError(null)
      const newEvent = await calendarService.createEvent(eventData)
      setEvents(prev => [...prev, newEvent])
      return newEvent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [calendarService])

  // Update event
  const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>) => {
    if (!calendarService) throw new Error('User not authenticated')

    try {
      setError(null)
      const updatedEvent = await calendarService.updateEvent(eventId, updates)
      setEvents(prev => prev.map(event => 
        event.id === eventId ? updatedEvent : event
      ))
      return updatedEvent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [calendarService])

  // Delete event
  const deleteEvent = useCallback(async (eventId: string) => {
    if (!calendarService) throw new Error('User not authenticated')

    try {
      setError(null)
      await calendarService.deleteEvent(eventId)
      setEvents(prev => prev.filter(event => event.id !== eventId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [calendarService])

  // Get events by date range
  const getEventsByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    if (!calendarService) return []

    try {
      setError(null)
      return await calendarService.getEventsByDateRange(startDate, endDate)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get events by date range'
      setError(errorMessage)
      return []
    }
  }, [calendarService])

  // Search events
  const searchEvents = useCallback(async (query: string) => {
    if (!calendarService) return []

    try {
      setError(null)
      return await calendarService.searchEvents(query)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search events'
      setError(errorMessage)
      return []
    }
  }, [calendarService])

  // Get recurring events
  const getRecurringEvents = useCallback(async () => {
    if (!calendarService) return []

    try {
      setError(null)
      return await calendarService.getRecurringEvents()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recurring events'
      setError(errorMessage)
      return []
    }
  }, [calendarService])

  // Subscribe to real-time updates
  const subscribeToUpdates = useCallback((callback: (payload: any) => void) => {
    if (!calendarService) return null

    try {
      return calendarService.subscribeToEvents(callback)
    } catch (err) {
      console.error('Failed to subscribe to updates:', err)
      return null
    }
  }, [calendarService])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    events,
    loading,
    error,
    calendarService,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsByDateRange,
    searchEvents,
    getRecurringEvents,
    subscribeToUpdates,
    clearError,
    isAuthenticated: !!user
  }
}
