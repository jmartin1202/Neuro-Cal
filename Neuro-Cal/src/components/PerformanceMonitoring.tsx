import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Globe, 
  HardDrive,
  Network,
  Server,
  Zap,
  TrendingUp,
  TrendingDown,
  MousePointer
} from 'lucide-react';
import { trackPerformanceMetric } from '@/lib/analytics';

interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  pagePerformance: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  resourcePerformance: {
    totalResources: number;
    slowResources: number;
    averageLoadTime: number;
    largestResource: string;
  };
  errors: {
    total: number;
    critical: number;
    warnings: number;
    lastError?: string;
  };
  system: {
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
    databaseResponseTime: number;
  };
}

export const PerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    coreWebVitals: { lcp: 0, fid: 0, cls: 0, ttfb: 0 },
    pagePerformance: { loadTime: 0, domContentLoaded: 0, firstPaint: 0, firstContentfulPaint: 0 },
    resourcePerformance: { totalResources: 0, slowResources: 0, averageLoadTime: 0, largestResource: '' },
    errors: { total: 0, critical: 0, warnings: 0 },
    system: { memoryUsage: 0, cpuUsage: 0, networkLatency: 0, databaseResponseTime: 0 }
  });

  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
  }>>([]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      updatePerformanceMetrics();
      checkForAlerts();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, checkForAlerts]);

  const updatePerformanceMetrics = () => {
    // Simulate performance data updates
    setMetrics(prev => ({
      ...prev,
      coreWebVitals: {
        lcp: Math.random() * 3 + 1, // 1-4 seconds
        fid: Math.random() * 100 + 10, // 10-110ms
        cls: Math.random() * 0.2, // 0-0.2
        ttfb: Math.random() * 500 + 100 // 100-600ms
      },
      pagePerformance: {
        loadTime: Math.random() * 2 + 0.5, // 0.5-2.5 seconds
        domContentLoaded: Math.random() * 1 + 0.2, // 0.2-1.2 seconds
        firstPaint: Math.random() * 0.5 + 0.1, // 0.1-0.6 seconds
        firstContentfulPaint: Math.random() * 0.8 + 0.2 // 0.2-1.0 seconds
      },
      resourcePerformance: {
        totalResources: Math.floor(Math.random() * 50) + 20, // 20-70 resources
        slowResources: Math.floor(Math.random() * 10), // 0-10 slow resources
        averageLoadTime: Math.random() * 200 + 50, // 50-250ms
        largestResource: ['main.js', 'vendor.js', 'styles.css', 'images/hero.jpg'][Math.floor(Math.random() * 4)]
      },
      errors: {
        total: Math.floor(Math.random() * 5),
        critical: Math.floor(Math.random() * 2),
        warnings: Math.floor(Math.random() * 3),
        lastError: Math.random() > 0.7 ? 'Network timeout on API call' : undefined
      },
      system: {
        memoryUsage: Math.random() * 30 + 40, // 40-70%
        cpuUsage: Math.random() * 40 + 20, // 20-60%
        networkLatency: Math.random() * 100 + 20, // 20-120ms
        databaseResponseTime: Math.random() * 50 + 10 // 10-60ms
      }
    }));
  };

  const checkForAlerts = useCallback(() => {
    const newAlerts: Array<{
      id: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      timestamp: Date;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    // Check Core Web Vitals
    if (metrics.coreWebVitals.lcp > 2.5) {
      newAlerts.push({
        id: `alert-${Date.now()}-1`,
        type: 'warning',
        message: `LCP (${metrics.coreWebVitals.lcp.toFixed(1)}s) is above recommended threshold`,
        timestamp: new Date(),
        severity: 'medium'
      });
    }

    if (metrics.coreWebVitals.fid > 100) {
      newAlerts.push({
        id: `alert-${Date.now()}-2`,
        type: 'warning',
        message: `FID (${metrics.coreWebVitals.fid.toFixed(0)}ms) indicates poor interactivity`,
        timestamp: new Date(),
        severity: 'medium'
      });
    }

    // Check System Resources
    if (metrics.system.memoryUsage > 80) {
      newAlerts.push({
        id: `alert-${Date.now()}-3`,
        type: 'error',
        message: `High memory usage: ${metrics.system.memoryUsage.toFixed(1)}%`,
        timestamp: new Date(),
        severity: 'high'
      });
    }

    if (metrics.system.cpuUsage > 70) {
      newAlerts.push({
        id: `alert-${Date.now()}-4`,
        type: 'warning',
        message: `High CPU usage: ${metrics.system.cpuUsage.toFixed(1)}%`,
        timestamp: new Date(),
        severity: 'medium'
      });
    }

    // Check Errors
    if (metrics.errors.critical > 0) {
      newAlerts.push({
        id: `alert-${Date.now()}-5`,
        type: 'error',
        message: `${metrics.errors.critical} critical error(s) detected`,
        timestamp: new Date(),
        severity: 'high'
      });
    }

    // Update alerts if there are new ones
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
    }
  }, [metrics]);

  const getPerformanceScore = () => {
    let score = 100;
    
    // Core Web Vitals scoring
    if (metrics.coreWebVitals.lcp > 2.5) score -= 20;
    if (metrics.coreWebVitals.fid > 100) score -= 20;
    if (metrics.coreWebVitals.cls > 0.1) score -= 20;
    
    // System resource scoring
    if (metrics.system.memoryUsage > 80) score -= 15;
    if (metrics.system.cpuUsage > 70) score -= 15;
    
    // Error scoring
    if (metrics.errors.critical > 0) score -= 20;
    
    return Math.max(score, 0);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">Real-time monitoring of application performance and system health</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'Pause' : 'Resume'} Monitoring
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-6xl font-bold">
              <span className={getPerformanceColor(getPerformanceScore())}>
                {getPerformanceScore()}
              </span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant={getPerformanceScore() >= 90 ? 'default' : getPerformanceScore() >= 70 ? 'secondary' : 'destructive'}>
                {getPerformanceScore() >= 90 ? 'Excellent' : getPerformanceScore() >= 70 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
          </div>
          <Progress value={getPerformanceScore()} className="h-3 mt-4" />
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      <Tabs defaultValue="core-web-vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="page-performance">Page Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="core-web-vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Largest Contentful Paint (LCP)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {metrics.coreWebVitals.lcp.toFixed(1)}s
                </div>
                <Badge variant={metrics.coreWebVitals.lcp <= 2.5 ? 'default' : 'destructive'}>
                  {metrics.coreWebVitals.lcp <= 2.5 ? 'Good' : 'Poor'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Target: ≤2.5s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  First Input Delay (FID)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {metrics.coreWebVitals.fid.toFixed(0)}ms
                </div>
                <Badge variant={metrics.coreWebVitals.fid <= 100 ? 'default' : 'destructive'}>
                  {metrics.coreWebVitals.fid <= 100 ? 'Good' : 'Poor'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Target: ≤100ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Cumulative Layout Shift (CLS)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {metrics.coreWebVitals.cls.toFixed(3)}
                </div>
                <Badge variant={metrics.coreWebVitals.cls <= 0.1 ? 'default' : 'destructive'}>
                  {metrics.coreWebVitals.cls <= 0.1 ? 'Good' : 'Poor'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Target: ≤0.1
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Time to First Byte (TTFB)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {metrics.coreWebVitals.ttfb.toFixed(0)}ms
                </div>
                <Badge variant={metrics.coreWebVitals.ttfb <= 600 ? 'default' : 'destructive'}>
                  {metrics.coreWebVitals.ttfb <= 600 ? 'Good' : 'Poor'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Target: ≤600ms
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="page-performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Load Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>First Paint</span>
                    <span className="font-medium">{metrics.pagePerformance.firstPaint.toFixed(1)}s</span>
                  </div>
                  <Progress value={(metrics.pagePerformance.firstPaint / 2) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>First Contentful Paint</span>
                    <span className="font-medium">{metrics.pagePerformance.firstContentfulPaint.toFixed(1)}s</span>
                  </div>
                  <Progress value={(metrics.pagePerformance.firstContentfulPaint / 2) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>DOM Content Loaded</span>
                    <span className="font-medium">{metrics.pagePerformance.domContentLoaded.toFixed(1)}s</span>
                  </div>
                  <Progress value={(metrics.pagePerformance.domContentLoaded / 2) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Full Page Load</span>
                    <span className="font-medium">{metrics.pagePerformance.loadTime.toFixed(1)}s</span>
                  </div>
                  <Progress value={(metrics.pagePerformance.loadTime / 3) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.pagePerformance.loadTime > 2 && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      Page load time is above recommended 2s threshold
                    </div>
                  )}
                  
                  {metrics.pagePerformance.firstPaint > 0.5 && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      First paint is taking longer than expected
                    </div>
                  )}
                  
                  {metrics.pagePerformance.loadTime <= 2 && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Page load performance is excellent
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.resourcePerformance.totalResources}</div>
                    <div className="text-sm text-muted-foreground">Total Resources</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{metrics.resourcePerformance.slowResources}</div>
                    <div className="text-sm text-muted-foreground">Slow Resources</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Average Load Time</span>
                    <span className="font-medium">{metrics.resourcePerformance.averageLoadTime.toFixed(0)}ms</span>
                  </div>
                  <Progress value={(metrics.resourcePerformance.averageLoadTime / 300) * 100} className="h-2" />
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Largest Resource:</span>
                  <div className="font-medium">{metrics.resourcePerformance.largestResource}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.resourcePerformance.slowResources > 0 && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      {metrics.resourcePerformance.slowResources} resources are loading slowly
                    </div>
                  )}
                  
                  {metrics.resourcePerformance.averageLoadTime > 200 && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      Consider optimizing resource loading
                    </div>
                  )}
                  
                  {metrics.resourcePerformance.slowResources === 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      All resources are loading efficiently
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Memory Usage</span>
                    <span className="font-medium">{metrics.system.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.system.memoryUsage} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>CPU Usage</span>
                    <span className="font-medium">{metrics.system.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.system.cpuUsage} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Network Latency</span>
                    <span className="font-medium">{metrics.system.networkLatency.toFixed(0)}ms</span>
                  </div>
                  <Progress value={(metrics.system.networkLatency / 200) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Database Response</span>
                    <span className="font-medium">{metrics.system.databaseResponseTime.toFixed(0)}ms</span>
                  </div>
                  <Progress value={(metrics.system.databaseResponseTime / 100) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.system.memoryUsage > 80 && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      High memory usage detected
                    </div>
                  )}
                  
                  {metrics.system.cpuUsage > 70 && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      High CPU usage detected
                    </div>
                  )}
                  
                  {metrics.system.networkLatency > 100 && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      Network latency is high
                    </div>
                  )}
                  
                  {metrics.system.memoryUsage <= 80 && metrics.system.cpuUsage <= 70 && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      System resources are healthy
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
