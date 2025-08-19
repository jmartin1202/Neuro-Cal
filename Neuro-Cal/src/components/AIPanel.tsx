import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Brain, Clock, TrendingUp, Calendar, Zap, Lightbulb } from "lucide-react";
import { Event, EventCard } from "./EventCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { aiService, AISuggestion, SmartSchedulingResult } from "@/lib/aiService";
import { useEvents } from "@/hooks/useEvents";

interface AIPanelProps {
  upcomingEvents: Event[];
  onCreateEvent: (eventText: string) => void;
}

export const AIPanel = ({ upcomingEvents, onCreateEvent }: AIPanelProps) => {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiInsights, setAiInsights] = useState<AISuggestion[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSchedulingResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isMobile = useIsMobile();
  const { events } = useEvents();

  // Load AI insights on component mount
  useEffect(() => {
    const loadInsights = async () => {
      try {
        const insights = await aiService.generateInsights(events);
        setAiInsights(insights);
      } catch (error) {
        console.error('Failed to load AI insights:', error);
      }
    };

    loadInsights();
  }, [events]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      // Use enhanced AI service for natural language parsing
      const parsedEvent = await aiService.parseNaturalLanguage(inputText);
      
      // Generate smart scheduling suggestions
      const suggestions = await aiService.suggestOptimalTimes(
        parsedEvent.type,
        parsedEvent.duration,
        parsedEvent.date,
        events
      );
      
      setSmartSuggestions(suggestions);
      setShowSuggestions(true);
      
      // Create the event with AI assistance
      const eventText = `${parsedEvent.title} on ${parsedEvent.date.toLocaleDateString()} at ${parsedEvent.time} for ${parsedEvent.duration} minutes`;
      onCreateEvent(eventText);
      setInputText("");
    } catch (error) {
      console.error('AI processing failed:', error);
      // Fallback to simple event creation
      onCreateEvent(inputText);
      setInputText("");
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, onCreateEvent, events]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
  }, []);

  const handleSmartScheduling = useCallback(async () => {
    if (!smartSuggestions) return;
    
    // Use the first suggested time slot
    const firstSuggestion = smartSuggestions.suggestedTimes[0];
    if (firstSuggestion) {
      const eventText = `Meeting at ${firstSuggestion.startTime.toLocaleTimeString()} - ${firstSuggestion.reason}`;
      onCreateEvent(eventText);
      setShowSuggestions(false);
      setSmartSuggestions(null);
    }
  }, [smartSuggestions, onCreateEvent]);

  const suggestions = [
    "Schedule team standup tomorrow at 9am",
    "Block 2 hours for focused work this afternoon",
    "Plan lunch with Sarah next week",
    "Add travel time to airport meeting"
  ];

  const getInsightIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'productivity':
        return <TrendingUp className="w-4 h-4" />;
      case 'balance':
        return <Clock className="w-4 h-4" />;
      case 'optimization':
        return <Zap className="w-4 h-4" />;
      case 'time_slot':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getInsightColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className={`${isMobile ? 'w-full border-t border-border' : 'w-80 border-l border-border'} bg-gradient-card p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto max-h-full`}>
      {/* AI Assistant */}
      <Card className="border-primary/20 bg-gradient-ai">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              placeholder="Tell me what you want to schedule..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="bg-background/50"
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isProcessing || !inputText.trim()}
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </form>

          {/* Smart Scheduling Suggestions */}
          {showSuggestions && smartSuggestions && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Smart Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {smartSuggestions.suggestedTimes.map((suggestion, index) => (
                  <div key={index} className="p-2 rounded-lg bg-background/50 border border-primary/20">
                    <div className="text-sm font-medium">
                      {suggestion.startTime.toLocaleTimeString()} - {suggestion.endTime.toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {suggestion.reason}
                    </div>
                    <div className="text-xs text-primary">
                      Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
                {smartSuggestions.conflicts.length > 0 && (
                  <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="text-sm font-medium text-destructive">
                      ⚠️ Conflicts Detected
                    </div>
                    {smartSuggestions.conflicts.slice(0, 2).map((conflict, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {conflict.title} - {conflict.conflictType}
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  onClick={handleSmartScheduling}
                  className="w-full"
                  size="sm"
                >
                  Use Best Time
                </Button>
              </CardContent>
            </Card>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2">Quick suggestions:</h4>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-background/50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.slice(0, isMobile ? 3 : 5).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                className="text-sm"
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming events</p>
              <p className="text-xs">Create your first event above!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiInsights.length > 0 ? (
            aiInsights.slice(0, isMobile ? 2 : 4).map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{insight.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getInsightColor(insight.priority)}`}
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  {insight.actionable && (
                    <div className="text-xs text-primary mt-1">
                      💡 Actionable insight
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No insights yet</p>
              <p className="text-xs">Add more events to get AI insights</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};