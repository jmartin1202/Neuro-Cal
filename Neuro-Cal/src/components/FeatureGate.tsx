import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Zap, Calendar, BarChart3, Users, Download, Clock, Star } from 'lucide-react';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

interface FeatureConfig {
  name: string;
  icon: React.ReactNode;
  description: string;
  basic: boolean;
  pro: boolean;
  trial: boolean;
}

const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  ai_suggestions: {
    name: 'AI Suggestions',
    icon: <Zap className="h-5 w-5" />,
    description: 'Intelligent scheduling suggestions powered by AI',
    basic: true,
    pro: true,
    trial: true
  },
  advanced_ai: {
    name: 'Advanced AI',
    icon: <Star className="h-5 w-5" />,
    description: 'Advanced AI features including meeting preparation and travel time calculations',
    basic: false,
    pro: true,
    trial: true
  },
  calendar_integrations: {
    name: 'Calendar Integrations',
    icon: <Calendar className="h-5 w-5" />,
    description: 'Connect multiple calendar services',
    basic: true,
    pro: true,
    trial: true
  },
  analytics: {
    name: 'Analytics Dashboard',
    icon: <BarChart3 className="h-5 w-5" />,
    description: 'Detailed insights and analytics about your scheduling patterns',
    basic: false,
    pro: true,
    trial: true
  },
  team_features: {
    name: 'Team Collaboration',
    icon: <Users className="h-5 w-5" />,
    description: 'Collaborate with team members on scheduling',
    basic: false,
    pro: true,
    trial: true
  },
  export: {
    name: 'Data Export',
    icon: <Download className="h-5 w-5" />,
    description: 'Export your calendar data and analytics',
    basic: false,
    pro: true,
    trial: true
  },
  unlimited_usage: {
    name: 'Unlimited Usage',
            icon: <InfinityIcon className="h-5 w-5" />,
    description: 'No limits on AI suggestions or integrations',
    basic: false,
    pro: true,
    trial: true
  }
};

const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback,
  showUpgradePrompt = true 
}) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    checkFeatureAccess();
  }, [feature]);

  const checkFeatureAccess = async () => {
    try {
      const response = await fetch(`/api/features/check/${feature}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      setHasAccess(response.ok);
    } catch (error) {
      console.error('Failed to check feature access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    // Navigate to billing page
    window.location.href = '/dashboard/billing';
  };

  const handleMaybeLater = () => {
    setShowPrompt(false);
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded" />;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const featureConfig = FEATURE_CONFIGS[feature] || {
    name: feature.replace('_', ' '),
    icon: <Zap className="h-5 w-5" />,
    description: 'Premium feature',
    basic: false,
    pro: true,
    trial: true
  };

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="blur-sm pointer-events-none">
        {children}
      </div>
      
      {/* Upgrade overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            {featureConfig.icon}
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            {featureConfig.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {featureConfig.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span>Basic Plan</span>
              <Badge variant={featureConfig.basic ? 'default' : 'secondary'}>
                {featureConfig.basic ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Pro Plan</span>
              <Badge variant={featureConfig.pro ? 'default' : 'secondary'}>
                {featureConfig.pro ? '✓' : '✗'}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleUpgradeClick}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Upgrade to Pro
            </Button>
            <Button 
              variant="outline" 
              onClick={handleMaybeLater}
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Just $9.99/month • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

// Infinity icon component
const InfinityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1" />
  </svg>
);

// Hook for checking feature access
export const useFeatureAccess = (feature: string) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch(`/api/features/check/${feature}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        setHasAccess(response.ok);
      } catch (error) {
        console.error('Failed to check feature access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [feature]);

  return { hasAccess, loading };
};

// Higher-order component for feature gating
export const withFeatureGate = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: string,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <FeatureGate feature={feature} fallback={fallback}>
      <WrappedComponent {...props} />
    </FeatureGate>
  );
};

export default FeatureGate;
