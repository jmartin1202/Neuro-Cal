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
  MousePointer,
  BarChart3,
  Cpu,
  MemoryStick,
  Wifi,
  HardDriveIcon
} from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { performanceConfig } from '@/config/environment';

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
  const { metrics, isMonitoring, alerts, startMonitoring, stopMonitoring, clearAlerts } = usePerformanceMonitor();
  




  const updatePerformanceMetrics = useCallback(() => {
    // Simulate performance metrics collection
    const newMetrics = {
      coreWebVitals: {
        lcp: Math.random() * 3 + 1,
        fid: Math.random() * 100 + 20,
        cls: Math.random() * 0.2,
        ttfb: Math.random() * 500 + 100
      },
      pagePerformance: {
        loadTime: Math.random() * 2 + 0.5,
        domContentLoaded: Math.random() * 1 + 0.2,
        firstPaint: Math.random() * 1 + 0.1,
        firstContentfulPaint: Math.random() * 1.5 + 0.3
      },
      resourcePerformance: {
        totalResources: Math.floor(Math.random() * 50) + 20,
        slowResources: Math.floor(Math.random() * 10),
        averageLoadTime: Math.random() * 200 + 50,
        largestResource: 'main.js'
      },
      errors: {
        total: Math.floor(Math.random() * 5),
        critical: Math.floor(Math.random() * 2),
        warnings: Math.floor(Math.random() * 3),
        lastError: 'Network timeout'
      },
      system: {
        memoryUsage: Math.random() * 30 + 50,
        cpuUsage: Math.random() * 40 + 30,
        networkLatency: Math.random() * 100 + 20,
        databaseResponseTime: Math.random() * 200 + 50
      }
    };

    setMetrics(newMetrics);
  }, []);

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

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      updatePerformanceMetrics();
      checkForAlerts();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, updatePerformanceMetrics, checkForAlerts]);

  const getPerformanceScore = () => {
    let score = 100;
    
    // Deduct points for poor performance
    if (metrics.coreWebVitals.lcp > 2.5) score -= 20;
    if (metrics.coreWebVitals.fid > 100) score -= 20;
    if (metrics.coreWebVitals.cls > 0.1) score -= 20;
    if (metrics.system.memoryUsage > 80) score -= 15;
    if (metrics.system.cpuUsage > 70) score -= 15;
    if (metrics.errors.critical > 0) score -= 20;
    
    return Math.max(score, 0);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getPerformanceColor(getPerformanceScore())}`}>
                {getPerformanceScore()}
              </div>
              <div className="text-sm text-muted-foreground">Performance Score</div>
              <div className="text-xs text-muted-foreground">
                {getPerformanceStatus(getPerformanceScore())}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {metrics.coreWebVitals.lcp.toFixed(1)}s
              </div>
              <div className="text-sm text-muted-foreground">LCP</div>
              <div className="text-xs text-muted-foreground">
                {metrics.coreWebVitals.lcp > 2.5 ? 'Needs improvement' : 'Good'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {metrics.coreWebVitals.fid.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">FID</div>
              <div className="text-xs text-muted-foreground">
                {metrics.coreWebVitals.fid > 100 ? 'Needs improvement' : 'Good'}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Performance</span>
                <span>{getPerformanceScore()}%</span>
              </div>
              <Progress value={getPerformanceScore()} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Tabs defaultValue="core-web-vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="core-web-vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>LCP (Largest Contentful Paint)</span>
                    <span className={metrics.coreWebVitals.lcp > 2.5 ? 'text-red-600' : 'text-green-600'}>
                      {metrics.coreWebVitals.lcp.toFixed(2)}s
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.coreWebVitals.lcp / 2.5) * 100, 100)} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>FID (First Input Delay)</span>
                    <span className={metrics.coreWebVitals.fid > 100 ? 'text-red-600' : 'text-green-600'}>
                      {metrics.coreWebVitals.fid.toFixed(0)}ms
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.coreWebVitals.fid / 100) * 100, 100)} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CLS (Cumulative Layout Shift)</span>
                    <span className={metrics.coreWebVitals.cls > 0.1 ? 'text-red-600' : 'text-green-600'}>
                      {metrics.coreWebVitals.cls.toFixed(3)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.coreWebVitals.cls / 0.1) * 100, 100)} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>TTFB (Time to First Byte)</span>
                    <span className={metrics.coreWebVitals.ttfb > 600 ? 'text-red-600' : 'text-green-600'}>
                      {metrics.coreWebVitals.ttfb.toFixed(0)}ms
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.coreWebVitals.ttfb / 600) * 100, 100)} 
                    className="h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Page Load Time</span>
                    <span>{metrics.pagePerformance.loadTime.toFixed(2)}s</span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.pagePerformance.loadTime / 3) * 100, 100)} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>DOM Content Loaded</span>
                    <span>{metrics.pagePerformance.domContentLoaded.toFixed(2)}s</span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.pagePerformance.domContentLoaded / 1.5) * 100, 100)} 
                    className="h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span className={metrics.system.memoryUsage > 80 ? 'text-red-600' : 'text-green-600'}>
                      {metrics.system.memoryUsage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={metrics.system.memoryUsage} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span className={metrics.system.cpuUsage > 70 ? 'text-red-600' : 'text-green-600'}>
                      {metrics.system.cpuUsage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={metrics.system.cpuUsage} 
                    className="h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(-5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.type === 'error' 
                          ? 'border-red-200 bg-red-50' 
                          : alert.type === 'warning'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {alert.type === 'error' ? (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          ) : alert.type === 'warning' ? (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{alert.message}</span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                alert.severity === 'high' 
                                  ? 'bg-red-100 text-red-800'
                                  : alert.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <p className="text-lg font-medium">All Good!</p>
                  <p className="text-sm">No performance alerts at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? 'destructive' : 'default'}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
            <Button onClick={updatePerformanceMetrics} variant="outline">
              Refresh Metrics
            </Button>
            <Button onClick={() => setAlerts([])} variant="outline">
              Clear Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
