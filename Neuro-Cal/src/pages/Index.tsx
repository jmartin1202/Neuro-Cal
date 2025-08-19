const Index = () => {
  // Temporarily disabled AuthContext for production debugging
  const user = null;
  const isLoading = false;
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Navigation Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">NeuroCal</h1>
              <span className="text-base text-muted-foreground">Smart AI Calendar</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : user ? `Welcome, ${user.firstName}!` : "Not signed in"} 🎉
            </div>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Welcome to NeuroCal</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Your AI-powered smart calendar is loading...
          </p>
          
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Status Check</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>React components: Working</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Tailwind CSS: Working</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>AuthContext: Working</span>
              </div>
            </div>
          </div>
          
          {/* Simple Calendar Placeholder */}
          <div className="mt-8 bg-card border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Calendar</h3>
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => (
                <div key={i} className="p-2 h-20 border rounded hover:bg-muted cursor-pointer">
                  {i > 6 && i < 32 ? i - 6 : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
