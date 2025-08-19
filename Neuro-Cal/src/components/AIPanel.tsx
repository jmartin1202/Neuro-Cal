import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Brain, Clock, TrendingUp, Calendar } from "lucide-react";
import { Event, EventCard } from "./EventCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface AIPanelProps {
  upcomingEvents: Event[];
  onCreateEvent: (eventText: string) => void;
}

export const AIPanel = ({ upcomingEvents, onCreateEvent }: AIPanelProps) => {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      onCreateEvent(inputText);
      setInputText("");
      setIsProcessing(false);
    }, 1500);
  };

  const suggestions = [
    "Schedule team standup tomorrow at 9am",
    "Block 2 hours for focused work this afternoon",
    "Plan lunch with Sarah next week",
    "Add travel time to airport meeting"
  ];

  const aiInsights = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Productivity Peak",
      description: "Your most productive hours are 9-11 AM",
      type: "success" as const
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Meeting Overload",
      description: "Consider blocking focus time on Thursday",
      type: "warning" as const
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      title: "Free Slot",
      description: "Perfect time for deep work: Tomorrow 2-4 PM",
      type: "info" as const
    }
  ];

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

          <div>
            <h4 className="text-sm font-medium mb-2">Quick suggestions:</h4>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputText(suggestion);
                    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                  }}
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
            <TrendingUp className="w-5 h-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="mt-0.5">{insight.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium">{insight.title}</h4>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
              <Badge variant={insight.type === "success" ? "default" : insight.type === "warning" ? "destructive" : "secondary"} className="text-xs">
                {insight.type}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};