import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Clock, MapPin, Users, Calendar } from "lucide-react";
import { Event } from "./EventCard";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onCreateEvent: (event: Omit<Event, 'id'>) => void;
}

export const CreateEventModal = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onCreateEvent 
}: CreateEventModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    time: "09:00",
    duration: "1 hour",
    location: "",
    attendees: "",
    type: "meeting" as const,
    description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse attendees from comma-separated string
      const attendeeList = formData.attendees
        .split(",")
        .map(name => name.trim())
        .filter(name => name.length > 0);

      // Convert 24-hour time to 12-hour format
      const convertTo12Hour = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      };

      // Create the event object
      const newEvent: Omit<Event, 'id'> = {
        title: formData.title,
        time: convertTo12Hour(formData.time),
        duration: formData.duration,
        date: selectedDate, // Include the selected date
        location: formData.location || undefined,
        attendees: attendeeList.length > 0 ? attendeeList : undefined,
        color: getEventColor(formData.type),
        type: formData.type
      };

      await onCreateEvent(newEvent);
      
      // Reset form and close modal
      setFormData({
        title: "",
        time: "09:00",
        duration: "1 hour",
        location: "",
        attendees: "",
        type: "meeting",
        description: ""
      });
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case "meeting":
        return "bg-calendar-event";
      case "focus":
        return "bg-primary";
      case "break":
        return "bg-accent";
      case "travel":
        return "bg-destructive";
      default:
        return "bg-calendar-event";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create New Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <strong>Date:</strong> {formatDate(selectedDate)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15 min">15 minutes</SelectItem>
                  <SelectItem value="30 min">30 minutes</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                  <SelectItem value="2 hours">2 hours</SelectItem>
                  <SelectItem value="3 hours">3 hours</SelectItem>
                  <SelectItem value="4 hours">4 hours</SelectItem>
                  <SelectItem value="All day">All day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Event Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: Event['type']) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="focus">Focus Work</SelectItem>
                <SelectItem value="break">Break</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Office, Conference Room, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees</Label>
            <Input
              id="attendees"
              value={formData.attendees}
              onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value }))}
              placeholder="John, Sarah, Mike (comma-separated)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
