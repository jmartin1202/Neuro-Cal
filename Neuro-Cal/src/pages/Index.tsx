const Index = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'red', fontSize: '48px' }}>🚨 DEBUG MODE 🚨</h1>
      <p style={{ fontSize: '24px', marginBottom: '20px' }}>
        If you can see this red text, React is working!
      </p>
      
      <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
        <h2>Test Results:</h2>
        <ul style={{ fontSize: '18px' }}>
          <li>✅ HTML rendering: Working</li>
          <li>✅ React JSX: Working</li>
          <li>✅ Basic styling: Working</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '2px solid blue' }}>
        <h3>Current Time: {new Date().toLocaleString()}</h3>
        <p>This proves JavaScript is executing</p>
      </div>
    </div>
  );
};

export default Index;
