import { useEffect, useRef, useState } from 'react'
import { createSession } from '../services/api'
import styles from './Timer.module.css'

const SESSION_TYPES = ['Pomodoro', 'Short Break', 'Long Break'] as const
type SessionType = typeof SESSION_TYPES[number]

interface TimerProps {
  topics: Array<{ id: string; name: string }>
  selectedTopicId: string | null
  durations: Record<SessionType, number>
}

export default function Timer({ topics, selectedTopicId, durations }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(10) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState<SessionType>('Pomodoro')
  const [completionMessage, setCompletionMessage] = useState<string | null>(null)
  const notificationSound = useRef<HTMLAudioElement>(null)

  const selectedTopic = topics.find(topic => topic.id === selectedTopicId)

  const handleTimerCompletion = async () => {
    // Play notification sound
    notificationSound.current?.play()

    // Save the session if a topic is selected
    if (selectedTopicId) {
      try {
        // Calculate the actual duration (initial duration - time left)
        const initialDuration = durations[sessionType] * 60
        const actualDuration = initialDuration - timeLeft
        
        console.log('Saving session:', {
          topicId: selectedTopicId,
          durationSeconds: actualDuration,
          sessionType
        })

        await createSession(selectedTopicId, actualDuration)
      } catch (error) {
        console.error('Failed to save session:', error)
      }
    }

    // Show completion message
    setCompletionMessage(`Your ${sessionType} session is complete!`)
    setIsRunning(false)
  }

  useEffect(() => {
    let interval: number | undefined

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerCompletion()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, timeLeft, selectedTopicId, sessionType, durations])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(durations[sessionType] * 60)
    setCompletionMessage(null)
  }

  const changeSessionType = (newType: SessionType) => {
    setSessionType(newType)
    setTimeLeft(durations[newType] * 60)
    setIsRunning(false)
    setCompletionMessage(null)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.timerCard}>
      <audio ref={notificationSound} src="/notification.mp3" />
      
      {completionMessage ? (
        <div className={styles.completionMessage}>
          <h2>{completionMessage}</h2>
          <div className={styles.time}>{formatTime(timeLeft)}</div>
          <p>What would you like to do next?</p>
          <div className={styles.sessionButtons}>
            {SESSION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => changeSessionType(type)}
                className={styles.sessionButton}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {selectedTopic && (
            <div className={styles.topicDisplay}>
              <h3>Current Topic: {selectedTopic.name}</h3>
            </div>
          )}
          <h2>{sessionType}</h2>
          <div className={styles.time}>
            {formatTime(timeLeft)}
          </div>
          <div className={styles.controls}>
            <button
              onClick={toggleTimer}
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
            >
              Reset
            </button>
          </div>
          <div className={styles.sessionButtons}>
            {SESSION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => changeSessionType(type)}
                className={styles.sessionButton}
              >
                {type}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 