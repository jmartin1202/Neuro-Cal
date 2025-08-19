import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, MessageSquare, Bug, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { trackUserFeedback } from '@/lib/analytics';

interface FeedbackItem {
  id: string;
  type: 'rating' | 'comment' | 'bug_report';
  content: string;
  rating?: number;
  category?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  timestamp: Date;
  userAgent: string;
}

export const UserFeedback = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [feedbackType, setFeedbackType] = useState<'rating' | 'comment' | 'bug_report'>('rating');
  const [category, setCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([
    {
      id: '1',
      type: 'rating',
      content: 'Great calendar app! The AI assistant is really helpful.',
      rating: 5,
      status: 'reviewed',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      userAgent: navigator.userAgent
    },
    {
      id: '2',
      type: 'bug_report',
      content: 'Events sometimes don\'t save properly when creating multiple events quickly.',
      category: 'Event Creation',
      status: 'pending',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      userAgent: navigator.userAgent
    }
  ]);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);

    try {
      // Track feedback in analytics
      trackUserFeedback(feedbackType, feedback, rating);

      // Create new feedback item
      const newFeedback: FeedbackItem = {
        id: `feedback-${Date.now()}`,
        type: feedbackType,
        content: feedback,
        rating: feedbackType === 'rating' ? rating : undefined,
        category: feedbackType === 'bug_report' ? category : undefined,
        status: 'pending',
        timestamp: new Date(),
        userAgent: navigator.userAgent
      };

      // Add to local state
      setFeedbackHistory(prev => [newFeedback, ...prev]);

      // Reset form
      setFeedback('');
      setRating(0);
      setCategory('');
      setFeedbackType('rating');
      setShowFeedbackDialog(false);

      // Show success message
      console.log('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'rating':
        return <Star className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'bug_report':
        return <Bug className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Feedback</h1>
          <p className="text-muted-foreground">Help us improve NeuroCal by sharing your thoughts and reporting issues</p>
        </div>
        <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Submit Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Share Your Feedback</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Feedback Type Selection */}
              <div className="space-y-2">
                <Label>Feedback Type</Label>
                <Select value={feedbackType} onValueChange={(value: any) => setFeedbackType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating & Review</SelectItem>
                    <SelectItem value="comment">General Comment</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rating (only for rating type) */}
              {feedbackType === 'rating' && (
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition-colors ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rating === 0 && 'Click to rate'}
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                </div>
              )}

              {/* Category (only for bug reports) */}
              {feedbackType === 'bug_report' && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Event Creation">Event Creation</SelectItem>
                      <SelectItem value="Calendar Sync">Calendar Sync</SelectItem>
                      <SelectItem value="AI Assistant">AI Assistant</SelectItem>
                      <SelectItem value="User Interface">User Interface</SelectItem>
                      <SelectItem value="Performance">Performance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Feedback Content */}
              <div className="space-y-2">
                <Label>Your Feedback</Label>
                <Textarea
                  placeholder={
                    feedbackType === 'rating' 
                      ? 'Tell us what you think about NeuroCal...'
                      : feedbackType === 'comment'
                      ? 'Share your thoughts, suggestions, or comments...'
                      : 'Describe the issue you encountered...'
                  }
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || !feedback.trim() || (feedbackType === 'rating' && rating === 0)}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Feedback Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFeedbackType('rating');
                setRating(5);
                setFeedback('Love the AI assistant!');
                setShowFeedbackDialog(true);
              }}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              Love it!
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFeedbackType('rating');
                setRating(1);
                setFeedback('Having issues with the app');
                setShowFeedbackDialog(true);
              }}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              Issues
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFeedbackType('comment');
                setFeedback('Feature request: Dark mode');
                setShowFeedbackDialog(true);
              }}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Feature Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Feedback History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedbackHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No feedback submitted yet. Be the first to share your thoughts!
              </p>
            ) : (
              feedbackHistory.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getFeedbackIcon(item.type)}
                      <span className="font-medium capitalize">{item.type.replace('_', ' ')}</span>
                      {item.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < item.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm">{item.content}</p>
                  
                  {item.category && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Category:</span>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.timestamp.toLocaleDateString()}</span>
                    <span>{item.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
