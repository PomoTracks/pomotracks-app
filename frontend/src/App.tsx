import { useState, useEffect } from 'react'
import Timer from './components/Timer'

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
    <div>
      <p>API Status: {apiStatus}</p>
      <Timer />
    </div>
  )
}

export default App 