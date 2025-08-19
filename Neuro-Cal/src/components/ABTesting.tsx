import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Clock, 
  Target,
  BarChart3,
  Zap
} from 'lucide-react';
import { getExperimentVariant, trackEvent } from '@/lib/analytics';

interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: {
    id: string;
    name: string;
    description: string;
    traffic: number;
    conversionRate: number;
    users: number;
    clicks: number;
    impressions: number;
  }[];
  status: 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  goal: string;
  metric: string;
}

export const ABTesting = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([
    {
      id: '1',
      name: 'AI Assistant Button Placement',
      description: 'Testing different positions for the AI assistant button to improve engagement',
      variants: [
        {
          id: 'control',
          name: 'Control (Right Sidebar)',
          description: 'Current AI assistant placement in the right sidebar',
          traffic: 50,
          conversionRate: 12.5,
          users: 450,
          clicks: 56,
          impressions: 450
        },
        {
          id: 'variant-a',
          name: 'Variant A (Floating Button)',
          description: 'AI assistant as a floating action button in the bottom right',
          traffic: 50,
          conversionRate: 18.2,
          users: 450,
          clicks: 82,
          impressions: 450
        }
      ],
      status: 'active',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      goal: 'Increase AI assistant usage',
      metric: 'Click-through rate'
    },
    {
      id: '2',
      name: 'Event Creation Flow',
      description: 'Testing simplified vs. detailed event creation forms',
      variants: [
        {
          id: 'control',
          name: 'Control (Detailed Form)',
          description: 'Current comprehensive event creation form',
          traffic: 50,
          conversionRate: 65.2,
          users: 380,
          clicks: 248,
          impressions: 380
        },
        {
          id: 'variant-b',
          name: 'Variant B (Quick Form)',
          description: 'Simplified 3-field event creation form',
          traffic: 50,
          conversionRate: 78.9,
          users: 380,
          clicks: 300,
          impressions: 380
        }
      ],
      status: 'active',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      goal: 'Increase event creation completion',
      metric: 'Form completion rate'
    }
  ]);

  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [currentVariant, setCurrentVariant] = useState<string>('control');

  useEffect(() => {
    // Get current variant for the user
    const variant = getExperimentVariant('ai_assistant_placement');
    setCurrentVariant(variant);
    
    // Track experiment exposure
    trackEvent('Experiment Exposure', {
      experiment_name: 'ai_assistant_placement',
      variant: variant,
      user_id: 'demo-user'
    });
  }, []);

  const getStatisticalSignificance = (control: number, variant: number, controlUsers: number, variantUsers: number) => {
    // Simple statistical significance calculation
    const pooledRate = (control + variant) / (controlUsers + variantUsers);
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/controlUsers + 1/variantUsers));
    const zScore = Math.abs((variant/variantUsers - control/controlUsers) / standardError);
    
    if (zScore > 2.58) return '99%';
    if (zScore > 1.96) return '95%';
    if (zScore > 1.65) return '90%';
    return 'Not significant';
  };

  const getWinner = (experiment: Experiment) => {
    const control = experiment.variants.find(v => v.id === 'control');
    const variant = experiment.variants.find(v => v.id !== 'control');
    
    if (!control || !variant) return null;
    
    const controlRate = control.conversionRate;
    const variantRate = variant.conversionRate;
    
    if (variantRate > controlRate * 1.1) return variant.id;
    if (controlRate > variantRate * 1.1) return control.id;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">A/B Testing Dashboard</h1>
          <p className="text-muted-foreground">Test different UI variations and measure their impact on user behavior</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <TestTube className="h-3 w-3" />
            {experiments.filter(e => e.status === 'active').length} Active Tests
          </Badge>
          <Button variant="outline" size="sm">Create Experiment</Button>
        </div>
      </div>

      {/* Current User Variant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Current Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">AI Assistant Placement:</span>
              <Badge variant="secondary">
                {currentVariant === 'control' ? 'Right Sidebar' : 'Floating Button'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Event Form:</span>
              <Badge variant="secondary">Quick Form</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You're currently experiencing the {currentVariant === 'control' ? 'control' : 'variant'} version of our experiments.
          </p>
        </CardContent>
      </Card>

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.map((experiment) => (
          <Card key={experiment.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedExperiment(experiment)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    {experiment.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{experiment.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={experiment.status === 'active' ? 'default' : 'secondary'}>
                    {experiment.status}
                  </Badge>
                  {getWinner(experiment) && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      🏆 Winner: {experiment.variants.find(v => v.id === getWinner(experiment))?.name}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experiment.variants.map((variant) => (
                  <div key={variant.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{variant.name}</h4>
                      <Badge variant="outline">{variant.traffic}% traffic</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{variant.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Users:</span>
                        <div className="font-medium">{variant.users}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Conversion:</span>
                        <div className="font-medium">{variant.conversionRate}%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Performance</span>
                        <span>{variant.conversionRate}%</span>
                      </div>
                      <Progress value={variant.conversionRate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Goal:</span>
                  <span className="font-medium">{experiment.goal}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Metric:</span>
                  <span className="font-medium">{experiment.metric}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Started:</span>
                  <span className="font-medium">{experiment.startDate.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Experiment View */}
      {selectedExperiment && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {selectedExperiment.name} - Detailed Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="analysis">Statistical Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedExperiment.variants.reduce((sum, v) => sum + v.users, 0)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Best Variant</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedExperiment.variants.reduce((best, current) => 
                          current.conversionRate > best.conversionRate ? current : best
                        ).name}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        +{Math.round(
                          (Math.max(...selectedExperiment.variants.map(v => v.conversionRate)) - 
                           Math.min(...selectedExperiment.variants.map(v => v.conversionRate))) / 
                          Math.min(...selectedExperiment.variants.map(v => v.conversionRate)) * 100
                        )}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="space-y-4">
                  {selectedExperiment.variants.map((variant) => (
                    <Card key={variant.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{variant.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{variant.users}</div>
                            <div className="text-sm text-muted-foreground">Users</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{variant.impressions}</div>
                            <div className="text-sm text-muted-foreground">Impressions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{variant.clicks}</div>
                            <div className="text-sm text-muted-foreground">Clicks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{variant.conversionRate}%</div>
                            <div className="text-sm text-muted-foreground">Conversion Rate</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Statistical Significance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedExperiment.variants.slice(1).map((variant) => {
                        const control = selectedExperiment.variants.find(v => v.id === 'control');
                        if (!control) return null;
                        
                        const significance = getStatisticalSignificance(
                          control.clicks,
                          variant.clicks,
                          control.users,
                          variant.users
                        );
                        
                        return (
                          <div key={variant.id} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">Control vs {variant.name}</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Control Conversion:</span>
                                <div className="font-medium">{control.conversionRate}%</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{variant.name} Conversion:</span>
                                <div className="font-medium">{variant.conversionRate}%</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Improvement:</span>
                                <div className="font-medium text-green-600">
                                  +{Math.round((variant.conversionRate - control.conversionRate) / control.conversionRate * 100)}%
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Significance:</span>
                                <Badge variant={significance.includes('Not') ? 'secondary' : 'default'}>
                                  {significance}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
