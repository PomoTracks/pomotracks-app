import { useState, useEffect } from 'react'
import { Topic, createSession } from '../services/api'
import styles from './Timer.module.css'

interface TimerProps {
  topics: Topic[]
  selectedTopicId: string | null
}

export default function Timer({ topics, selectedTopicId }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(5)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedTopic = topics.find(topic => topic.id === selectedTopicId)

  useEffect(() => {
    let interval: number | undefined

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      if (selectedTopicId) {
        saveSession()
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, timeLeft, selectedTopicId])

  const saveSession = async () => {
    if (!selectedTopicId) return

    try {
      await createSession(selectedTopicId, 5)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session')
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(5)
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.timerCard}>
      {selectedTopic ? (
        <div className={styles.topicDisplay} style={{marginBottom: '0.5rem'}}>
          {selectedTopic.name}
        </div>
      ) : (
        <div className={styles.topicDisplay} style={{marginBottom: '0.5rem'}}>
          Please select a topic to start
        </div>
      )}

      {error && (
        <div className="text-red-500" style={{marginBottom: '1rem'}}>
          {error}
        </div>
      )}

      <div className={styles.timeDisplay} style={{marginBottom: '1.5rem'}}>
        {formatTime(timeLeft)}
      </div>

      <div className={styles.controlButtons}>
        <button
          onClick={toggleTimer}
          disabled={!selectedTopic}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
        >
          Reset
        </button>
      </div>
    </div>
  )
} 