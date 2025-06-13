import { useState, useEffect } from 'react'
import styles from './Timer.module.css'

function Timer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)

  const toggleTimer = () => {
    setIsActive(prev => !prev)
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
    <div className={styles.timerContainer}>
      <div className={styles.timeDisplay}>{formatTime(timeLeft)}</div>
      <button 
        className={styles.controlButton} 
        onClick={toggleTimer}
      >
        {isActive ? 'PAUSE' : 'START'}
      </button>
    </div>
  )
}

export default Timer 