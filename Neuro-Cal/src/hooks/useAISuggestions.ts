import { useState, useEffect, useCallback } from 'react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { createAISuggestionsService, AISuggestionsService } from '@/lib/aiSuggestionsService'
import { Database } from '@/lib/supabase'

type AISuggestion = Database['public']['Tables']['ai_suggestions']['Row']

export const useAISuggestions = () => {
  const { user } = useSupabaseAuth()
  const [aiService, setAiService] = useState<AISuggestionsService | null>(null)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize AI service when user changes
  useEffect(() => {
    if (user) {
      setAiService(createAISuggestionsService(user))
    } else {
      setAiService(null)
      setSuggestions([])
    }
  }, [user])

  // Load all suggestions
  const loadSuggestions = useCallback(async (eventId?: string) => {
    if (!aiService) return

    try {
      setLoading(true)
      setError(null)
      const fetchedSuggestions = await aiService.getSuggestions(eventId)
      setSuggestions(fetchedSuggestions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }, [aiService])

  // Create a new suggestion
  const createSuggestion = useCallback(async (
    suggestionType: string,
    content: string,
    eventId?: string
  ) => {
    if (!aiService) throw new Error('User not authenticated')

    try {
      setError(null)
      const newSuggestion = await aiService.createSuggestion(suggestionType, content, eventId)
      setSuggestions(prev => [newSuggestion, ...prev])
      return newSuggestion
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create suggestion'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [aiService])

  // Mark suggestion as applied
  const markSuggestionApplied = useCallback(async (suggestionId: string) => {
    if (!aiService) throw new Error('User not authenticated')

    try {
      setError(null)
      await aiService.markSuggestionApplied(suggestionId)
      setSuggestions(prev => prev.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, is_applied: true }
          : suggestion
      ))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark suggestion as applied'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [aiService])

  // Delete a suggestion
  const deleteSuggestion = useCallback(async (suggestionId: string) => {
    if (!aiService) throw new Error('User not authenticated')

    try {
      setError(null)
      await aiService.deleteSuggestion(suggestionId)
      setSuggestions(prev => prev.filter(suggestion => suggestion.id !== suggestionId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete suggestion'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [aiService])

  // Get suggestions by type
  const getSuggestionsByType = useCallback(async (suggestionType: string) => {
    if (!aiService) return []

    try {
      setError(null)
      return await aiService.getSuggestionsByType(suggestionType)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get suggestions by type'
      setError(errorMessage)
      return []
    }
  }, [aiService])

  // Get unapplied suggestions
  const getUnappliedSuggestions = useCallback(async () => {
    if (!aiService) return []

    try {
      setError(null)
      return await aiService.getUnappliedSuggestions()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get unapplied suggestions'
      setError(errorMessage)
      return []
    }
  }, [aiService])

  // Get event-specific suggestions
  const getEventSuggestions = useCallback(async (eventId: string) => {
    if (!aiService) return []

    try {
      setError(null)
      return await aiService.getEventSuggestions(eventId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get event suggestions'
      setError(errorMessage)
      return []
    }
  }, [aiService])

  // Bulk create suggestions
  const bulkCreateSuggestions = useCallback(async (suggestions: Array<{
    suggestion_type: string
    content: string
    event_id?: string
  }>) => {
    if (!aiService) throw new Error('User not authenticated')

    try {
      setError(null)
      const newSuggestions = await aiService.bulkCreateSuggestions(suggestions)
      setSuggestions(prev => [...newSuggestions, ...prev])
      return newSuggestions
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk create suggestions'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [aiService])

  // Get suggestion statistics
  const getSuggestionStats = useCallback(async () => {
    if (!aiService) return null

    try {
      setError(null)
      return await aiService.getSuggestionStats()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get suggestion stats'
      setError(errorMessage)
      return null
    }
  }, [aiService])

  // Subscribe to real-time updates
  const subscribeToUpdates = useCallback((callback: (payload: any) => void) => {
    if (!aiService) return null

    try {
      return aiService.subscribeToSuggestions(callback)
    } catch (err) {
      console.error('Failed to subscribe to AI suggestion updates:', err)
      return null
    }
  }, [aiService])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Filter suggestions by various criteria
  const getFilteredSuggestions = useCallback((filters: {
    applied?: boolean
    type?: string
    eventId?: string
  }) => {
    return suggestions.filter(suggestion => {
      if (filters.applied !== undefined && suggestion.is_applied !== filters.applied) {
        return false
      }
      if (filters.type && suggestion.suggestion_type !== filters.type) {
        return false
      }
      if (filters.eventId && suggestion.event_id !== filters.eventId) {
        return false
      }
      return true
    })
  }, [suggestions])

  return {
    suggestions,
    loading,
    error,
    aiService,
    loadSuggestions,
    createSuggestion,
    markSuggestionApplied,
    deleteSuggestion,
    getSuggestionsByType,
    getUnappliedSuggestions,
    getEventSuggestions,
    bulkCreateSuggestions,
    getSuggestionStats,
    subscribeToUpdates,
    getFilteredSuggestions,
    clearError,
    isAuthenticated: !!user
  }
}
