import { useState, useEffect } from 'react'
import Timer from './components/Timer'
import { TopicManager } from './components/TopicManager'
import { Topic, getTopics, createTopic } from './services/api'
import ProgressTracker from './components/ProgressTracker'
import './App.css'

function App() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)

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
      await createTopic(name, type)
      await fetchTopics()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topic')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <h1 className="app-header">PomoTracks</h1>
      <div className="main-content">
        <Timer topics={topics} selectedTopicId={selectedTopicId} />
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
      </div>
    </div>
  )
}

export default App 