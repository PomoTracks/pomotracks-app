import { useState, useEffect } from 'react'
import styles from './Timer.module.css'

const SESSION_DURATIONS = {
  'Pomodoro': 25 * 60,
  'Short Break': 5 * 60,
  'Long Break': 15 * 60
} as const

type SessionType = keyof typeof SESSION_DURATIONS

function Timer() {
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATIONS['Pomodoro'])
  const [isActive, setIsActive] = useState(false)
  const [sessionType, setSessionType] = useState<SessionType>('Pomodoro')

  const toggleTimer = () => {
    setIsActive(prev => !prev)
  }

  const changeSessionType = (newType: SessionType) => {
    setIsActive(false)
    setSessionType(newType)
    setTimeLeft(SESSION_DURATIONS[newType])
  }

  useEffect(() => {
    let intervalId: number | undefined

    if (isActive && timeLeft > 0) {
      intervalId = window.setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isActive, timeLeft])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div>
      <div className={styles.controlPanel}>
        {(Object.keys(SESSION_DURATIONS) as SessionType[]).map((type) => (
          <button
            key={type}
            className={`${styles.sessionButton} ${sessionType === type ? styles.activeButton : ''}`}
            onClick={() => changeSessionType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className={styles.timerContainer}>
        <div className={styles.timeDisplay}>{formatTime(timeLeft)}</div>
        <button 
          className={styles.controlButton} 
          onClick={toggleTimer}
        >
          {isActive ? 'PAUSE' : 'START'}
        </button>
      </div>
    </div>
  )
}

export default Timer 