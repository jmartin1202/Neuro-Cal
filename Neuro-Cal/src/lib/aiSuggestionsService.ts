import { supabaseTyped, Database } from './supabase'
import { User } from '@supabase/supabase-js'

type AISuggestion = Database['public']['Tables']['ai_suggestions']['Row']
type AISuggestionInsert = Database['public']['Tables']['ai_suggestions']['Insert']
type AISuggestionUpdate = Database['public']['Tables']['ai_suggestions']['Update']

export interface SuggestionContent {
  type: 'time_optimization' | 'conflict_resolution' | 'productivity_tip' | 'meeting_suggestion' | 'schedule_optimization'
  title: string
  description: string
  action?: string
  priority: 'low' | 'medium' | 'high'
  metadata?: Record<string, any>
}

export class AISuggestionsService {
  private user: User

  constructor(user: User) {
    this.user = user
  }

  // Create a new AI suggestion
  async createSuggestion(
    suggestionType: string,
    content: string,
    eventId?: string
  ): Promise<AISuggestion> {
    const { data, error } = await supabaseTyped
      .from('ai_suggestions')
      .insert([{
        user_id: this.user.id,
        event_id: eventId,
        suggestion_type: suggestionType,
        content,
        is_applied: false
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating AI suggestion:', error)
      throw new Error('Failed to create AI suggestion')
    }

    return data
  }

  // Get all suggestions for a user
  async getSuggestions(eventId?: string): Promise<AISuggestion[]> {
    let query = supabaseTyped
      .from('ai_suggestions')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false })

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching AI suggestions:', error)
      throw new Error('Failed to fetch AI suggestions')
    }

    return data || []
  }

  // Get suggestions by type
  async getSuggestionsByType(suggestionType: string): Promise<AISuggestion[]> {
    const { data, error } = await supabaseTyped
      .from('ai_suggestions')
      .select('*')
      .eq('user_id', this.user.id)
      .eq('suggestion_type', suggestionType)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching AI suggestions by type:', error)
      throw new Error('Failed to fetch AI suggestions')
    }

    return data || []
  }

  // Mark a suggestion as applied
  async markSuggestionApplied(suggestionId: string): Promise<void> {
    const { error } = await supabaseTyped
      .from('ai_suggestions')
      .update({ is_applied: true })
      .eq('id', suggestionId)
      .eq('user_id', this.user.id)

    if (error) {
      console.error('Error marking suggestion as applied:', error)
      throw new Error('Failed to mark suggestion as applied')
    }
  }

  // Delete a suggestion
  async deleteSuggestion(suggestionId: string): Promise<void> {
    const { error } = await supabaseTyped
      .from('ai_suggestions')
      .delete()
      .eq('id', suggestionId)
      .eq('user_id', this.user.id)

    if (error) {
      console.error('Error deleting AI suggestion:', error)
      throw new Error('Failed to delete AI suggestion')
    }
  }

  // Get unapplied suggestions
  async getUnappliedSuggestions(): Promise<AISuggestion[]> {
    const { data, error } = await supabaseTyped
      .from('ai_suggestions')
      .select('*')
      .eq('user_id', this.user.id)
      .eq('is_applied', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching unapplied suggestions:', error)
      throw new Error('Failed to fetch unapplied suggestions')
    }

    return data || []
  }

  // Get suggestions for a specific event
  async getEventSuggestions(eventId: string): Promise<AISuggestion[]> {
    const { data, error } = await supabaseTyped
      .from('ai_suggestions')
      .select('*')
      .eq('user_id', this.user.id)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching event suggestions:', error)
      throw new Error('Failed to fetch event suggestions')
    }

    return data || []
  }

  // Subscribe to real-time updates for suggestions
  subscribeToSuggestions(callback: (payload: any) => void) {
    return supabaseTyped
      .channel('ai_suggestions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_suggestions',
          filter: `user_id=eq.${this.user.id}`
        },
        callback
      )
      .subscribe()
  }

  // Bulk create suggestions (useful for AI processing)
  async bulkCreateSuggestions(suggestions: Array<{
    suggestion_type: string
    content: string
    event_id?: string
  }>): Promise<AISuggestion[]> {
    const suggestionsWithUserId = suggestions.map(suggestion => ({
      ...suggestion,
      user_id: this.user.id,
      is_applied: false
    }))

    const { data, error } = await supabaseTyped
      .from('ai_suggestions')
      .insert(suggestionsWithUserId)
      .select()

    if (error) {
      console.error('Error bulk creating AI suggestions:', error)
      throw new Error('Failed to bulk create AI suggestions')
    }

    return data || []
  }

  // Get suggestion statistics
  async getSuggestionStats(): Promise<{
    total: number
    applied: number
    unapplied: number
    byType: Record<string, number>
  }> {
    const { data, error } = await supabaseTyped
      .from('ai_suggestions')
      .select('*')
      .eq('user_id', this.user.id)

    if (error) {
      console.error('Error fetching suggestion stats:', error)
      throw new Error('Failed to fetch suggestion stats')
    }

    const suggestions = data || []
    const byType: Record<string, number> = {}

    suggestions.forEach(suggestion => {
      byType[suggestion.suggestion_type] = (byType[suggestion.suggestion_type] || 0) + 1
    })

    return {
      total: suggestions.length,
      applied: suggestions.filter(s => s.is_applied).length,
      unapplied: suggestions.filter(s => !s.is_applied).length,
      byType
    }
  }
}

// Factory function to create AI suggestions service
export const createAISuggestionsService = (user: User) => new AISuggestionsService(user)
