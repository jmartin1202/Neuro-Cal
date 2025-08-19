import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useToast } from './ui/use-toast';
import { Loader2, CreditCard, Calendar, Zap, Users, BarChart3, Download } from 'lucide-react';

interface Subscription {
  id: string;
  status: 'trial' | 'active' | 'canceled' | 'past_due' | 'unpaid' | 'expired';
  plan_name: string;
  display_name: string;
  trial_start_date?: string;
  trial_end_date?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

interface UsageData {
  feature: string;
  usage_count: number;
  limit: number;
  is_unlimited: boolean;
  percentage_used: number;
}

const SubscriptionManagement: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [subscriptionRes, usageRes] = await Promise.all([
        fetch('/api/billing/subscription', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }),
        fetch('/api/billing/usage', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
      ]);

      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json();
        setSubscription(subscriptionData);
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'trial': return 'Trial Active';
      case 'active': return 'Active';
      case 'canceled': return 'Canceled';
      case 'past_due': return 'Payment Due';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const getTrialProgress = () => {
    if (!subscription?.trial_end_date) return 0;
    
    const now = new Date();
    const endDate = new Date(subscription.trial_end_date);
    const startDate = new Date(subscription.trial_start_date || now);
    
    const totalTrialDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysLeft = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    const daysUsed = totalTrialDays - daysLeft;
    
    return Math.max(0, Math.min(100, (daysUsed / totalTrialDays) * 100));
  };

  const getDaysLeft = () => {
    if (!subscription?.trial_end_date) return 0;
    
    const now = new Date();
    const endDate = new Date(subscription.trial_end_date);
    const daysLeft = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    return Math.ceil(Math.max(0, daysLeft));
  };

  const handleUpgrade = () => {
    setShowPaymentForm(true);
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }

    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ cancel_immediately: false })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Subscription canceled successfully. You will have access until the end of your billing period.'
        });
        loadSubscriptionData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to cancel subscription',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive'
      });
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to open billing portal',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open billing portal',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Subscription Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You don't have an active subscription. Please contact support to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {subscription.display_name} Plan
              <Badge className={getStatusColor(subscription.status)}>
                {getStatusText(subscription.status)}
              </Badge>
            </CardTitle>
            {subscription.cancel_at_period_end && (
              <Badge variant="secondary">Canceling at period end</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription.status === 'trial' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Your free trial ends in <strong>{getDaysLeft()} days</strong></span>
                <span>{Math.round(getTrialProgress())}% used</span>
              </div>
              <Progress value={getTrialProgress()} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Upgrade now to continue enjoying Pro features after your trial ends.
              </p>
            </div>
          )}

          {subscription.status === 'active' && (
            <div className="space-y-3">
              <div className="text-sm">
                <p><strong>Next billing date:</strong> {new Date(subscription.current_period_end!).toLocaleDateString()}</p>
                <p><strong>Amount:</strong> ${subscription.plan_name === 'basic' ? '4.99' : '9.99'}/month</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {subscription.status === 'trial' && (
              <Button onClick={handleUpgrade} className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Add Payment Method
              </Button>
            )}
            
            {subscription.status === 'active' && (
              <>
                <Button variant="outline" onClick={handleManageBilling} className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Manage Billing
                </Button>
                <Button variant="destructive" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usage.map((item) => (
              <div key={item.feature} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {item.feature === 'ai_suggestions' && <Zap className="h-4 w-4" />}
                    {item.feature === 'calendar_integrations' && <Calendar className="h-4 w-4" />}
                    <span className="capitalize">{item.feature.replace('_', ' ')}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {item.is_unlimited ? 'Unlimited' : `${item.usage_count}/${item.limit}`}
                  </span>
                </div>
                {!item.is_unlimited && (
                  <Progress value={item.percentage_used} className="h-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Your Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(subscription.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm capitalize">{feature.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentFormModal
          onClose={() => setShowPaymentForm(false)}
          onSuccess={() => {
            setShowPaymentForm(false);
            loadSubscriptionData();
          }}
        />
      )}
    </div>
  );
};

// Payment Form Modal Component
interface PaymentFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This would integrate with Stripe Elements in a real implementation
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success',
        description: 'Payment method added successfully!'
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add payment method',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Add Payment Method</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry</label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CVC</label>
              <input
                type="text"
                placeholder="123"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Payment Method
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
