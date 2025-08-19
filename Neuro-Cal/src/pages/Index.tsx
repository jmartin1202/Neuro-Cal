import React from "react";

const Index = () => {
  console.log("🚀 Index component rendering..."); // Debug log
  
  try {
    console.log("✅ About to render JSX..."); // Debug log
    
    const currentTime = new Date().toLocaleTimeString();
    console.log("✅ Current time:", currentTime); // Debug log
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                  <div className="h-12 w-12 text-white text-2xl">📅</div>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">NeuroCal</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                The AI-powered calendar that understands natural language and helps you schedule smarter, not harder.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg rounded-lg font-semibold"
                >
                  🚀 Get Started Free
                </button>
                
                <button 
                  className="px-8 py-3 text-lg border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  🔑 Sign In
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose NeuroCal?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience the future of calendar management with cutting-edge AI technology
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="h-8 w-8 text-blue-600 text-2xl">✨</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Scheduling</h3>
                <p className="text-gray-600">Just describe your event in plain English and let AI handle the details</p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="h-8 w-8 text-purple-600 text-2xl">⚡</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Optimization</h3>
                <p className="text-gray-600">AI suggests optimal times and helps avoid scheduling conflicts</p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="h-8 w-8 text-green-600 text-2xl">👥</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
                <p className="text-gray-600">Easily coordinate with team members and share calendars</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Calendar?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who are already scheduling smarter with NeuroCal
            </p>
            <button 
              className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold"
            >
              🚀 Start Your Free Trial
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm">
          <div>✅ Component rendered at: {currentTime}</div>
          <div>✅ React version: {React.version}</div>
          <div>✅ White screen issue: FIXED!</div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("🚨 ERROR in Index component:", error);
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">🚨 ERROR!</h1>
          <p className="text-xl mb-4">Something went wrong:</p>
          <pre className="bg-red-600 p-4 rounded text-sm">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    );
  }
};

export default Index;
