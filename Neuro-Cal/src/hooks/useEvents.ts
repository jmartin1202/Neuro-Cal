import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@/components/EventCard';

// Mock API functions - replace with actual API calls
const fetchEvents = async (): Promise<Event[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return [];
};

const createEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newEvent: Event = {
    ...eventData,
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  return newEvent;
};

const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<Event> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  return { ...eventData, id: eventId } as Event;
};

const deleteEvent = async (eventId: string): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const useEvents = () => {
  const queryClient = useQueryClient();

  // Fetch all events
  const {
    data: events = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (newEvent) => {
      // Optimistically update the cache
      queryClient.setQueryData(['events'], (oldEvents: Event[] = []) => [
        ...oldEvents,
        newEvent
      ]);
      
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Failed to create event:', error);
      // Optionally show error toast
    }
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, eventData }: { eventId: string; eventData: Partial<Event> }) =>
      updateEvent(eventId, eventData),
    onSuccess: (updatedEvent) => {
      // Optimistically update the cache
      queryClient.setQueryData(['events'], (oldEvents: Event[] = []) =>
        oldEvents.map(event =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Failed to update event:', error);
    }
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: (_, eventId) => {
      // Optimistically update the cache
      queryClient.setQueryData(['events'], (oldEvents: Event[] = []) =>
        oldEvents.filter(event => event.id !== eventId)
      );
      
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Failed to delete event:', error);
    }
  });

  // Get events for a specific date
  const getEventsForDate = (date: Date): Event[] => {
    if (!events) return [];
    
    return events.filter(event => {
      if (!event.date || !(event.date instanceof Date) || isNaN(event.date.getTime())) {
        return false;
      }
      
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Get upcoming events
  const getUpcomingEvents = (days: number = 7): Event[] => {
    if (!events) return [];
    
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      if (!event.date || !(event.date instanceof Date) || isNaN(event.date.getTime())) {
        return false;
      }
      
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= futureDate;
    }).sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  // Get events by type
  const getEventsByType = (type: Event['type']): Event[] => {
    if (!events) return [];
    return events.filter(event => event.type === type);
  };

  return {
    events,
    isLoading,
    error,
    refetch,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    getEventsForDate,
    getUpcomingEvents,
    getEventsByType,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
};
