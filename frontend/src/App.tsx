import { useState, useEffect } from 'react'
import Timer from './components/Timer'
import { TopicManager } from './components/TopicManager'

function App() {
  const [apiStatus, setApiStatus] = useState('connecting...')

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/health')
      .then(response => response.json())
      .then(data => {
        setApiStatus(data.status)
      })
      .catch(error => {
        console.error('Error fetching API status:', error)
        setApiStatus('error')
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">PomoTracks</h1>
        <p>API Status: {apiStatus}</p>
        <Timer />
        <TopicManager />
      </div>
    </div>
  )
}

export default App 