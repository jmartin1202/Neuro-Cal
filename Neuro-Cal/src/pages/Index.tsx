import React from "react";

const Index = () => {
  console.log("🚀 Index component rendering..."); // Debug log
  
  // Add some basic error handling
  try {
    console.log("✅ About to render JSX..."); // Debug log
    
    const currentTime = new Date().toLocaleTimeString();
    console.log("✅ Current time:", currentTime); // Debug log
    
    return (
      <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">🎉 IT WORKS!</h1>
          <p className="text-xl mb-8">If you can see this, the white screen issue is fixed!</p>
          <div className="bg-white text-blue-500 p-4 rounded-lg">
            <p className="font-mono text-sm">
              Component rendered successfully at: {currentTime}
            </p>
            <p className="font-mono text-sm mt-2">
              React version: {React.version}
            </p>
          </div>
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
