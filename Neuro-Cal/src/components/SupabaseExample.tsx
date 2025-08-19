import React, { useEffect } from 'react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { useCalendar } from '@/hooks/useCalendar'
import { useAISuggestions } from '@/hooks/useAISuggestions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export const SupabaseExample: React.FC = () => {
  const { user, signUp, signIn, signOut, loading: authLoading } = useSupabaseAuth()
  const { 
    events, 
    loading: calendarLoading, 
    createEvent, 
    loadEvents,
    error: calendarError 
  } = useCalendar()
  const { 
    suggestions, 
    createSuggestion, 
    loadSuggestions,
    error: suggestionsError 
  } = useAISuggestions()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [eventTitle, setEventTitle] = React.useState('')
  const [eventDescription, setEventDescription] = React.useState('')
  const [eventStartTime, setEventStartTime] = React.useState('')
  const [eventEndTime, setEventEndTime] = React.useState('')

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadEvents()
      loadSuggestions()
    }
  }, [user, loadEvents, loadSuggestions])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await signUp(email, password, firstName, lastName)
      if (error) {
        toast.error(`Sign up failed: ${error.message}`)
      } else {
        toast.success('Sign up successful! Please check your email to confirm your account.')
        setEmail('')
        setPassword('')
        setFirstName('')
        setLastName('')
      }
    } catch (error) {
      toast.error('Sign up failed')
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await signIn(email, password)
      if (error) {
        toast.error(`Sign in failed: ${error.message}`)
      } else {
        toast.success('Sign in successful!')
        setEmail('')
        setPassword('')
      }
    } catch (error) {
      toast.error('Sign in failed')
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle || !eventStartTime || !eventEndTime) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await createEvent({
        title: eventTitle,
        description: eventDescription,
        start_time: new Date(eventStartTime).toISOString(),
        end_time: new Date(eventEndTime).toISOString(),
        location: null,
        is_recurring: false,
        recurrence_pattern: null
      })
      
      toast.success('Event created successfully!')
      setEventTitle('')
      setEventDescription('')
      setEventStartTime('')
      setEventEndTime('')
    } catch (error) {
      toast.error('Failed to create event')
    }
  }

  const handleCreateSuggestion = async () => {
    try {
      await createSuggestion(
        'productivity_tip',
        'Consider adding buffer time between meetings to avoid running late.',
        undefined
      )
      toast.success('AI suggestion created!')
    } catch (error) {
      toast.error('Failed to create AI suggestion')
    }
  }

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create a new account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Sign Up</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Already have an account? Sign in here</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.user_metadata?.first_name || user.email}!</h1>
          <p className="text-gray-600">Your Supabase-powered NeuroCal dashboard</p>
        </div>
        <Button onClick={signOut} variant="outline">Sign Out</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Event</CardTitle>
            <CardDescription>Add a new calendar event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <Label htmlFor="eventTitle">Event Title *</Label>
                <Input
                  id="eventTitle"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="eventDescription">Description</Label>
                <Textarea
                  id="eventDescription"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="eventStartTime">Start Time *</Label>
                <Input
                  id="eventStartTime"
                  type="datetime-local"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="eventEndTime">End Time *</Label>
                <Input
                  id="eventEndTime"
                  type="datetime-local"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create Event</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>Generate AI-powered calendar insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleCreateSuggestion} className="w-full">
              Generate AI Suggestion
            </Button>
            {suggestionsError && (
              <p className="text-red-600 text-sm">{suggestionsError}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>Calendar events stored in Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          {calendarLoading ? (
            <p>Loading events...</p>
          ) : calendarError ? (
            <p className="text-red-600">{calendarError}</p>
          ) : events.length === 0 ? (
            <p className="text-gray-500">No events yet. Create your first event above!</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{event.title}</h3>
                  {event.description && (
                    <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Suggestions</CardTitle>
          <CardDescription>AI-generated insights for your calendar</CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <p className="text-gray-500">No AI suggestions yet. Generate some above!</p>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">
                      {suggestion.suggestion_type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      suggestion.is_applied 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {suggestion.is_applied ? 'Applied' : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-2">{suggestion.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(suggestion.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
