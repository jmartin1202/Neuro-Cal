import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertTriangle,
  Database,
  Globe,
  HardDrive,
  Network,
  Server,
  Cpu,
  Memory,
  Wifi,
  Shield,
  Settings,
  Download,
  RefreshCw,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface DeveloperAnalyticsData {
  realTime: {
    activeUsers: number;
    currentSessions: number;
    requestsPerMinute: number;
    errorRate: number;
    systemLoad: number;
  };
  performance: {
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
      ttfb: number;
    };
    pageMetrics: {
      loadTime: number;
      domContentLoaded: number;
      firstPaint: number;
      firstContentfulPaint: number;
    };
    resourceMetrics: {
      totalResources: number;
      slowResources: number;
      averageLoadTime: number;
      largestResource: string;
    };
  };
  analytics: {
    events: {
      total: number;
      thisHour: number;
      thisDay: number;
      topEvents: Array<{ name: string; count: number; percentage: number }>;
    };
    users: {
      total: number;
      active: number;
      new: number;
      retention: number;
      geographic: Array<{ country: string; users: number; percentage: number }>;
    };
    features: {
      usage: Record<string, { count: number; users: number; satisfaction: number }>;
      errors: Record<string, { count: number; lastOccurrence: string; severity: string }>;
    };
  };
  system: {
    health: {
      status: 'healthy' | 'warning' | 'critical';
      uptime: number;
      memoryUsage: number;
      cpuUsage: number;
      diskUsage: number;
      networkLatency: number;
    };
    errors: Array<{
      id: string;
      message: string;
      stack: string;
      timestamp: string;
      user: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      resolved: boolean;
    }>;
    alerts: Array<{
      id: string;
      type: 'performance' | 'error' | 'security' | 'system';
      message: string;
      timestamp: string;
      acknowledged: boolean;
    }>;
  };
}

export const DeveloperAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<DeveloperAnalyticsData>({
    realTime: {
      activeUsers: 0,
      currentSessions: 0,
      requestsPerMinute: 0,
      errorRate: 0,
      systemLoad: 0
    },
    performance: {
      coreWebVitals: { lcp: 0, fid: 0, cls: 0, ttfb: 0 },
      pageMetrics: { loadTime: 0, domContentLoaded: 0, firstPaint: 0, firstContentfulPaint: 0 },
      resourceMetrics: { totalResources: 0, slowResources: 0, averageLoadTime: 0, largestResource: '' }
    },
    analytics: {
      events: { total: 0, thisHour: 0, thisDay: 0, topEvents: [] },
      users: { total: 0, active: 0, new: 0, retention: 0, geographic: [] },
      features: { usage: {}, errors: {} }
    },
    system: {
      health: { status: 'healthy', uptime: 0, memoryUsage: 0, cpuUsage: 0, diskUsage: 0, networkLatency: 0 },
      errors: [],
      alerts: []
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    // Simulate loading developer analytics data
    const loadDeveloperAnalytics = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock comprehensive developer data
      setAnalyticsData({
        realTime: {
          activeUsers: 47,
          currentSessions: 23,
          requestsPerMinute: 156,
          errorRate: 0.8,
          systemLoad: 34.2
        },
        performance: {
          coreWebVitals: {
            lcp: 1.8,
            fid: 45,
            cls: 0.05,
            ttfb: 320
          },
          pageMetrics: {
            loadTime: 1.2,
            domContentLoaded: 0.8,
            firstPaint: 0.6,
            firstContentfulPaint: 0.9
          },
          resourceMetrics: {
            totalResources: 45,
            slowResources: 3,
            averageLoadTime: 180,
            largestResource: 'main.js (392KB)'
          }
        },
        analytics: {
          events: {
            total: 15420,
            thisHour: 89,
            thisDay: 2340,
            topEvents: [
              { name: 'Calendar View', count: 8920, percentage: 57.8 },
              { name: 'Event Creation', count: 4560, percentage: 29.6 },
              { name: 'AI Assistant', count: 1230, percentage: 8.0 },
              { name: 'Calendar Sync', count: 710, percentage: 4.6 }
            ]
          },
          users: {
            total: 1247,
            active: 892,
            new: 156,
            retention: 78.5,
            geographic: [
              { country: 'United States', users: 456, percentage: 36.6 },
              { country: 'United Kingdom', users: 234, percentage: 18.8 },
              { country: 'Canada', users: 123, percentage: 9.9 },
              { country: 'Germany', users: 98, percentage: 7.9 },
              { country: 'Australia', users: 87, percentage: 7.0 }
            ]
          },
          features: {
            usage: {
              'Calendar View': { count: 8920, users: 892, satisfaction: 4.2 },
              'Event Creation': { count: 4560, users: 456, satisfaction: 4.1 },
              'AI Assistant': { count: 1230, users: 234, satisfaction: 4.5 },
              'Calendar Sync': { count: 710, users: 189, satisfaction: 3.8 }
            },
            errors: {
              'Event Creation': { count: 23, lastOccurrence: '2024-08-19 06:35:12', severity: 'low' },
              'Calendar Sync': { count: 12, lastOccurrence: '2024-08-19 06:28:45', severity: 'medium' },
              'AI Assistant': { count: 8, lastOccurrence: '2024-08-19 06:15:33', severity: 'low' }
            }
          }
        },
        system: {
          health: {
            status: 'healthy',
            uptime: 86400, // 24 hours in seconds
            memoryUsage: 67.3,
            cpuUsage: 23.8,
            diskUsage: 45.2,
            networkLatency: 45
          },
          errors: [
            {
              id: 'ERR_001',
              message: 'Failed to sync calendar with Google',
              stack: 'Error: Network timeout at CalendarSync.sync()',
              timestamp: '2024-08-19 06:35:12',
              user: 'user_123',
              severity: 'medium',
              resolved: false
            },
            {
              id: 'ERR_002',
              message: 'AI response timeout',
              stack: 'Error: Request timeout at AIService.generateResponse()',
              timestamp: '2024-08-19 06:28:45',
              user: 'user_456',
              severity: 'low',
              resolved: true
            }
          ],
          alerts: [
            {
              id: 'ALT_001',
              type: 'performance',
              message: 'Page load time increased by 40%',
              timestamp: '2024-08-19 06:30:00',
              acknowledged: false
            },
            {
              id: 'ALT_002',
              type: 'system',
              message: 'Memory usage above 80% threshold',
              timestamp: '2024-08-19 06:25:00',
              acknowledged: true
            }
          ]
        }
      });
      
      setIsLoading(false);
    };

    loadDeveloperAnalytics();

    // Set up live data refresh
    if (isLive) {
      const interval = setInterval(() => {
        // Simulate real-time data updates
        setAnalyticsData(prev => ({
          ...prev,
          realTime: {
            ...prev.realTime,
            activeUsers: prev.realTime.activeUsers + Math.floor(Math.random() * 3) - 1,
            requestsPerMinute: prev.realTime.requestsPerMinute + Math.floor(Math.random() * 10) - 5,
            systemLoad: Math.max(0, Math.min(100, prev.systemLoad + (Math.random() - 0.5) * 5))
          }
        }));
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [isLive, refreshInterval]);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Developer Analytics</h1>
          <p className="text-gray-600">Comprehensive system monitoring and analytics dashboard</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="refresh-interval">Refresh:</Label>
            <Input
              id="refresh-interval"
              type="number"
              value={refreshInterval / 1000}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 1000)}
              className="w-20"
              min="1"
              max="60"
            />
            <span className="text-sm text-gray-500">seconds</span>
          </div>
          <Button
            variant={isLive ? "destructive" : "default"}
            onClick={() => setIsLive(!isLive)}
            size="sm"
          >
            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isLive ? 'Pause' : 'Live'}
          </Button>
          <Button onClick={() => window.location.reload()} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Real-time Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analyticsData.realTime.activeUsers}</div>
            <div className="text-xs text-gray-500">Currently online</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analyticsData.realTime.currentSessions}</div>
            <div className="text-xs text-gray-500">Active sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Requests/min</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analyticsData.realTime.requestsPerMinute}</div>
            <div className="text-xs text-gray-500">API calls</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analyticsData.realTime.errorRate}%</div>
            <div className="text-xs text-gray-500">Last minute</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">System Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analyticsData.system.health.status}</div>
            <div className="text-xs text-gray-500">{analyticsData.realTime.systemLoad.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="errors">Errors & Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className={`${getHealthStatusColor(analyticsData.system.health.status)} text-white`}>
                    {analyticsData.system.health.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium">{formatUptime(analyticsData.system.health.uptime)}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Memory</span>
                    <span className="text-sm font-medium">{analyticsData.system.health.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={analyticsData.system.health.memoryUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">CPU</span>
                    <span className="text-sm font-medium">{analyticsData.system.health.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={analyticsData.system.health.cpuUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">LCP</div>
                    <div className={`text-lg font-bold ${analyticsData.performance.coreWebVitals.lcp <= 2.5 ? 'text-green-600' : 'text-red-600'}`}>
                      {analyticsData.performance.coreWebVitals.lcp}s
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">FID</div>
                    <div className={`text-lg font-bold ${analyticsData.performance.coreWebVitals.fid <= 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {analyticsData.performance.coreWebVitals.fid}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">CLS</div>
                    <div className={`text-lg font-bold ${analyticsData.performance.coreWebVitals.cls <= 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                      {analyticsData.performance.coreWebVitals.cls}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">TTFB</div>
                    <div className={`text-lg font-bold ${analyticsData.performance.coreWebVitals.ttfb <= 600 ? 'text-green-600' : 'text-red-600'}`}>
                      {analyticsData.performance.coreWebVitals.ttfb}ms
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analyticsData.performance.coreWebVitals).map(([metric, value]) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 uppercase">{metric}</span>
                      <span className="text-sm text-gray-500">{value}{metric === 'cls' ? '' : metric === 'lcp' ? 's' : 'ms'}</span>
                    </div>
                    <Progress 
                      value={metric === 'cls' ? value * 1000 : metric === 'lcp' ? (value / 4) * 100 : (value / 200) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resource Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Resources</div>
                    <div className="text-2xl font-bold text-blue-600">{analyticsData.performance.resourceMetrics.totalResources}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Slow Resources</div>
                    <div className="text-2xl font-bold text-red-600">{analyticsData.performance.resourceMetrics.slowResources}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Avg Load Time</div>
                    <div className="text-2xl font-bold text-green-600">{analyticsData.performance.resourceMetrics.averageLoadTime}ms</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Largest Resource</div>
                    <div className="text-sm font-medium text-gray-700">{analyticsData.performance.resourceMetrics.largestResource}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Event Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{analyticsData.analytics.events.total.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Events</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{analyticsData.analytics.events.thisHour}</div>
                    <div className="text-sm text-gray-600">This Hour</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{analyticsData.analytics.events.thisDay}</div>
                    <div className="text-sm text-gray-600">This Day</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Top Events</div>
                  {analyticsData.analytics.events.topEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{event.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{event.count.toLocaleString()}</span>
                        <Badge variant="secondary">{event.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Users</div>
                    <div className="text-2xl font-bold text-blue-600">{analyticsData.analytics.users.total.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Active Users</div>
                    <div className="text-2xl font-bold text-green-600">{analyticsData.analytics.users.active.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">New Users</div>
                    <div className="text-2xl font-bold text-purple-600">{analyticsData.analytics.users.new.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Retention</div>
                    <div className="text-2xl font-bold text-orange-600">{analyticsData.analytics.users.retention}%</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Top Countries</div>
                  {analyticsData.analytics.users.geographic.slice(0, 3).map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{country.country}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{country.users.toLocaleString()}</span>
                        <Badge variant="outline">{country.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Memory Usage</span>
                      <span className="text-sm font-medium">{analyticsData.system.health.memoryUsage.toFixed(1)}%</span>
                    </div>
                    <Progress value={analyticsData.system.health.memoryUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">CPU Usage</span>
                      <span className="text-sm font-medium">{analyticsData.system.health.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <Progress value={analyticsData.system.health.cpuUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Disk Usage</span>
                      <span className="text-sm font-medium">{analyticsData.system.health.diskUsage.toFixed(1)}%</span>
                    </div>
                    <Progress value={analyticsData.system.health.diskUsage} className="h-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <div className="text-sm text-gray-600">Network Latency</div>
                    <div className="text-lg font-bold text-blue-600">{analyticsData.system.health.networkLatency}ms</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Uptime</div>
                    <div className="text-lg font-bold text-green-600">{formatUptime(analyticsData.system.health.uptime)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analyticsData.analytics.features.usage).map(([feature, data]) => (
                  <div key={feature} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{feature}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{data.count.toLocaleString()}</span>
                        <Badge variant="outline">{data.satisfaction}/5</Badge>
                      </div>
                    </div>
                    <Progress value={(data.count / analyticsData.analytics.events.total) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Errors & Alerts Tab */}
        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Errors */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.system.errors.map((error) => (
                  <div key={error.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getSeverityColor(error.severity)} text-white`}>
                        {error.severity}
                      </Badge>
                      <span className="text-xs text-gray-500">{error.timestamp}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-700">{error.message}</div>
                    <div className="text-xs text-gray-500">User: {error.user}</div>
                    <div className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                      {error.stack.split('\n')[0]}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.system.alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={alert.type === 'performance' ? 'default' : 'destructive'}>
                        {alert.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>
                    <div className="text-sm text-gray-700">{alert.message}</div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={alert.acknowledged ? 'secondary' : 'default'}>
                        {alert.acknowledged ? 'Acknowledged' : 'New'}
                      </Badge>
                      {!alert.acknowledged && (
                        <Button size="sm" variant="outline">Acknowledge</Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
