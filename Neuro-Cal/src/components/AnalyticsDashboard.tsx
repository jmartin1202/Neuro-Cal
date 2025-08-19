import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Activity, 
  BarChart3, 
  Eye, 
  MousePointer,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    new: number;
    retention: number;
  };
  events: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    averagePerUser: number;
  };
  performance: {
    pageLoadTime: number;
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
    errors: number;
  };
  engagement: {
    pageViews: number;
    sessionDuration: number;
    bounceRate: number;
    featureUsage: Record<string, number>;
  };
}

export const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    users: { total: 0, active: 0, new: 0, retention: 0 },
    events: { total: 0, thisWeek: 0, thisMonth: 0, averagePerUser: 0 },
    performance: { pageLoadTime: 0, coreWebVitals: { lcp: 0, fid: 0, cls: 0 }, errors: 0 },
    engagement: { pageViews: 0, sessionDuration: 0, bounceRate: 0, featureUsage: {} }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, this would come from your analytics APIs
      setAnalyticsData({
        users: {
          total: 1247,
          active: 892,
          new: 156,
          retention: 78.5
        },
        events: {
          total: 15420,
          thisWeek: 2340,
          thisMonth: 8920,
          averagePerUser: 12.4
        },
        performance: {
          pageLoadTime: 1.2,
          coreWebVitals: {
            lcp: 2.1,
            fid: 45,
            cls: 0.08
          },
          errors: 23
        },
        engagement: {
          pageViews: 45670,
          sessionDuration: 8.5,
          bounceRate: 32.1,
          featureUsage: {
            'Calendar View': 89,
            'Event Creation': 67,
            'AI Assistant': 78,
            'Calendar Sync': 45
          }
        }
      });
      
      setIsLoading(false);
    };

    loadAnalyticsData();
  }, [timeRange]);

  const getPerformanceScore = (lcp: number, fid: number, cls: number) => {
    let score = 100;
    
    if (lcp > 2.5) score -= 20;
    if (fid > 100) score -= 20;
    if (cls > 0.1) score -= 20;
    
    return Math.max(score, 0);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor your NeuroCal application performance and user engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Export Data</Button>
          <Button variant="outline" size="sm">Settings</Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Time Range:</span>
        {(['7d', '30d', '90d'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.users.new} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.users.active.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.users.retention}% retention rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.events.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.events.averagePerUser} per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.engagement.pageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.engagement.sessionDuration}min avg session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Largest Contentful Paint (LCP)</span>
                  <Badge variant={analyticsData.performance.coreWebVitals.lcp <= 2.5 ? 'default' : 'destructive'}>
                    {analyticsData.performance.coreWebVitals.lcp}s
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">First Input Delay (FID)</span>
                  <Badge variant={analyticsData.performance.coreWebVitals.fid <= 100 ? 'default' : 'destructive'}>
                    {analyticsData.performance.coreWebVitals.fid}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cumulative Layout Shift (CLS)</span>
                  <Badge variant={analyticsData.performance.coreWebVitals.cls <= 0.1 ? 'default' : 'destructive'}>
                    {analyticsData.performance.coreWebVitals.cls}
                  </Badge>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Performance Score</span>
                    <span className={`text-lg font-bold ${getPerformanceColor(getPerformanceScore(
                      analyticsData.performance.coreWebVitals.lcp,
                      analyticsData.performance.coreWebVitals.fid,
                      analyticsData.performance.coreWebVitals.cls
                    ))}`}>
                      {getPerformanceScore(
                        analyticsData.performance.coreWebVitals.lcp,
                        analyticsData.performance.coreWebVitals.fid,
                        analyticsData.performance.coreWebVitals.cls
                      )}/100
                    </span>
                  </div>
                  <Progress 
                    value={getPerformanceScore(
                      analyticsData.performance.coreWebVitals.lcp,
                      analyticsData.performance.coreWebVitals.fid,
                      analyticsData.performance.coreWebVitals.cls
                    )} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Page Load Time</span>
                  <Badge variant={analyticsData.performance.pageLoadTime <= 2 ? 'default' : 'destructive'}>
                    {analyticsData.performance.pageLoadTime}s
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Errors This Month</span>
                  <Badge variant={analyticsData.performance.errors === 0 ? 'default' : 'destructive'}>
                    {analyticsData.performance.errors}
                  </Badge>
                </div>
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {analyticsData.performance.coreWebVitals.lcp > 2.5 && (
                      <li>• Optimize images and reduce LCP</li>
                    )}
                    {analyticsData.performance.coreWebVitals.fid > 100 && (
                      <li>• Reduce JavaScript bundle size</li>
                    )}
                    {analyticsData.performance.coreWebVitals.cls > 0.1 && (
                      <li>• Fix layout shifts and use proper image dimensions</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Feature Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analyticsData.engagement.featureUsage).map(([feature, usage]) => (
                  <div key={feature} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{feature}</span>
                      <span className="text-sm font-medium">{usage}%</span>
                    </div>
                    <Progress value={usage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bounce Rate</span>
                  <Badge variant={analyticsData.engagement.bounceRate <= 30 ? 'default' : 'destructive'}>
                    {analyticsData.engagement.bounceRate}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Duration</span>
                  <Badge variant="default">
                    {analyticsData.engagement.sessionDuration} min
                  </Badge>
                </div>
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Insights</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Users spend {analyticsData.engagement.sessionDuration} minutes on average</li>
                    <li>• {analyticsData.engagement.bounceRate}% of users leave after one page</li>
                    <li>• Most popular feature: Calendar View ({Math.max(...Object.values(analyticsData.engagement.featureUsage))}%)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth & Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{analyticsData.users.new}</div>
                  <div className="text-sm text-muted-foreground">New Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analyticsData.users.retention}%</div>
                  <div className="text-sm text-muted-foreground">Retention Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analyticsData.users.active}</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Creation Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analyticsData.events.thisWeek}</div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analyticsData.events.thisMonth}</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analyticsData.events.averagePerUser}</div>
                  <div className="text-sm text-muted-foreground">Per User</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
