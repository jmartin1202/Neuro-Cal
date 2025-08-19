import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Brain, Clock, TrendingUp, Calendar } from "lucide-react";
import { Event, EventCard } from "./EventCard";

interface AIPanelProps {
  upcomingEvents: Event[];
  onCreateEvent: (eventText: string) => void;
}

export const AIPanel = ({ upcomingEvents, onCreateEvent }: AIPanelProps) => {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
    <div className="w-80 bg-gradient-card border-l border-border p-6 space-y-6 overflow-y-auto">
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
                  onClick={() => setInputText(suggestion)}
                  className="text-left text-xs text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-background/50 w-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiInsights.map((insight, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="mt-0.5 text-primary">
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium">{insight.title}</h4>
                  <Badge variant={insight.type === "warning" ? "destructive" : "secondary"} className="text-xs">
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Today's Agenda */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Today's Agenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No events scheduled for today</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};