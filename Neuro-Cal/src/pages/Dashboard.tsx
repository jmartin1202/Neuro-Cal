import { useState } from 'react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for overview
  const overviewData = {
    totalUsers: 1247,
    activeUsers: 892,
    totalEvents: 15420,
    pageViews: 45670,
    conversionRate: 78.5,
    performanceScore: 87,
    activeExperiments: 2,
    feedbackCount: 23
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">NeuroCal Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive analytics and monitoring for your smart calendar</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-sm bg-green-50 text-green-700 border border-green-200 rounded-full">
                +12.5% this week
              </span>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 p-1 bg-gray-100 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'performance', label: 'Performance', icon: '⚡' },
            { id: 'feedback', label: 'Feedback', icon: '💬' },
            { id: 'experiments', label: 'A/B Testing', icon: '🧪' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewData.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600">👥</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">+156 new this month</p>
              </div>

              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewData.activeUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-green-600">📈</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{overviewData.conversionRate}% retention rate</p>
              </div>

              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewData.totalEvents.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600">📅</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">12.4 per user average</p>
              </div>

              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Page Views</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewData.pageViews.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-orange-600">👁️</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">8.5min avg session</p>
              </div>
            </div>

            {/* Performance & Experiments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      overviewData.performanceScore >= 90 ? 'bg-green-100 text-green-800' : 
                      overviewData.performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {overviewData.performanceScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        overviewData.performanceScore >= 90 ? 'bg-green-600' : 
                        overviewData.performanceScore >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${overviewData.performanceScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {overviewData.performanceScore >= 90 ? 'Excellent performance' : 
                     overviewData.performanceScore >= 70 ? 'Good performance with room for improvement' : 
                     'Performance needs attention'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Experiments</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Running Tests</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {overviewData.activeExperiments}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>AI Assistant Placement</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Day 7</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Event Creation Flow</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Day 14</span>
                    </div>
                  </div>
                  <button className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    View All Experiments
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registration</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">User</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">AI assistant usage spike</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">AI</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Performance alert resolved</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Performance</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
            <p className="text-gray-600">
              Full analytics dashboard coming soon! This will include detailed user metrics, 
              event tracking, and performance data.
            </p>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Monitoring</h3>
            <p className="text-gray-600">
              Real-time performance monitoring with Core Web Vitals tracking coming soon!
            </p>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Feedback System</h3>
            <p className="text-gray-600">
              User feedback collection system with ratings, comments, and bug reports coming soon!
            </p>
          </div>
        )}

        {/* Experiments Tab */}
        {activeTab === 'experiments' && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">A/B Testing Platform</h3>
            <p className="text-gray-600">
              A/B testing platform for UI variations and statistical analysis coming soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
