import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  BarChart3, 
  Users, 
  Activity, 
  Settings, 
  LogOut, 
  ArrowLeft,
  TrendingUp,
  Eye,
  MousePointer,
  Zap,
  AlertTriangle,
  Clock,
  Target
} from "lucide-react";
import { AnalyticsDashboard as AnalyticsComponent } from "@/components/AnalyticsDashboard";
import { ABTesting } from "@/components/ABTesting";
import { PerformanceMonitoring } from "@/components/PerformanceMonitoring";
import { UserFeedback } from "@/components/UserFeedback";
import { DeveloperAnalytics } from "@/components/DeveloperAnalytics";

const AnalyticsDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "performance", label: "Performance", icon: Activity },
    { id: "ab-testing", label: "A/B Testing", icon: Target },
    { id: "feedback", label: "User Feedback", icon: Users },
    { id: "developer", label: "Developer", icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <AnalyticsComponent />;
      case "analytics":
        return <AnalyticsComponent />;
      case "performance":
        return <PerformanceMonitoring />;
      case "ab-testing":
        return <ABTesting />;
      case "feedback":
        return <UserFeedback />;
      case "developer":
        return <DeveloperAnalytics />;
      default:
        return <AnalyticsComponent />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Calendar</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">NeuroCal Analytics</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Live
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Go to Calendar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b bg-background">
        <div className="container">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto py-6">
        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold">1,247</p>
            <p className="text-xs text-green-600">+12% from last month</p>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Events Created</span>
            </div>
            <p className="text-2xl font-bold">15,420</p>
            <p className="text-xs text-green-600">+8% from last month</p>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Active Sessions</span>
            </div>
            <p className="text-2xl font-bold">892</p>
            <p className="text-xs text-blue-600">+5% from last month</p>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">AI Interactions</span>
            </div>
            <p className="text-2xl font-bold">3,456</p>
            <p className="text-xs text-green-600">+15% from last month</p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card border rounded-lg">
          {renderTabContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 mt-12">
        <div className="container py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>NeuroCal Analytics Dashboard</span>
              <span>•</span>
              <span>Real-time monitoring</span>
              <span>•</span>
              <span>v1.0.0</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>System Healthy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnalyticsDashboard;
