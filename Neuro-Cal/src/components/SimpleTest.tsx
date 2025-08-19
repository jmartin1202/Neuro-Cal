import React from 'react'

export const SimpleTest: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Test Component</h1>
      <p>If you can see this, React is working!</p>
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <p>This is a test to see if the basic React rendering works.</p>
      </div>
    </div>
  )
}
