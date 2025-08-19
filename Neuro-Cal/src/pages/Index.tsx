const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-red-600 mb-6">🚨 DEBUG MODE 🚨</h1>
        <p className="text-xl text-foreground mb-8">
          If you can see this red text with Tailwind styling, React + Tailwind is working!
        </p>
        
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Results:</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>HTML rendering: Working</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>React JSX: Working</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Tailwind CSS: Working</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>React Router: Working</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Current Status:</h3>
          <p className="text-lg text-muted-foreground mb-2">
            Current Time: {new Date().toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            This proves JavaScript is executing and Tailwind classes are working
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
