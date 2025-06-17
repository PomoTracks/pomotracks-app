import { useState, useEffect } from 'react'
import Timer from './components/Timer'
import { TopicManager } from './components/TopicManager'
import { Topic, getTopics, createTopic } from './services/api'
import ProgressTracker from './components/ProgressTracker'
import Settings from './components/Settings'
import './App.css'

const SESSION_TYPES = ['Pomodoro', 'Short Break', 'Long Break'] as const
type SessionType = typeof SESSION_TYPES[number]

function App() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [durations, setDurations] = useState<Record<SessionType, number>>({
    'Pomodoro': 25,
    'Short Break': 5,
    'Long Break': 15
  })

  const fetchTopics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedTopics = await getTopics()
      setTopics(fetchedTopics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [])

  const handleCreateTopic = async (name: string, type: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const newTopic = await createTopic(name, type)
      setTopics(prev => [...prev, newTopic])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topic')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>PomoTracks</h1>
      </header>
      <div className="main-content">
        <Timer topics={topics} selectedTopicId={selectedTopicId} durations={durations} />
        <TopicManager
          topics={topics}
          isLoading={isLoading}
          error={error}
          selectedTopicId={selectedTopicId}
          setSelectedTopicId={setSelectedTopicId}
          onCreateTopic={handleCreateTopic}
          onRefreshTopics={fetchTopics}
        />
        <ProgressTracker />
        <Settings durations={durations} setDurations={setDurations} />
      </div>
    </div>
  )
}

export default App 