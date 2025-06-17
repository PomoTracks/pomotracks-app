import { useState, useEffect } from 'react';
import styles from './Settings.module.css';

const SESSION_TYPES = ['Pomodoro', 'Short Break', 'Long Break'] as const;
type SessionType = typeof SESSION_TYPES[number];

interface SettingsProps {
  durations: Record<SessionType, number>;
  setDurations: (durations: Record<SessionType, number>) => void;
}

export default function Settings({ durations, setDurations }: SettingsProps) {
  const [localDurations, setLocalDurations] = useState(durations);

  useEffect(() => {
    setLocalDurations(durations);
  }, [durations]);

  const handleChange = (type: SessionType, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setLocalDurations(prev => ({
        ...prev,
        [type]: numValue
      }));
    }
  };

  const handleSave = () => {
    setDurations(localDurations);
  };

  return (
    <div className={styles.settingsCard}>
      <h2>Timer Settings</h2>
      <div className={styles.settingsForm}>
        {SESSION_TYPES.map((type) => (
          <div key={type} className={styles.settingRow}>
            <label htmlFor={type}>{type} Duration (minutes):</label>
            <input
              type="number"
              id={type}
              min="1"
              value={localDurations[type]}
              onChange={(e) => handleChange(type, e.target.value)}
            />
          </div>
        ))}
        <button onClick={handleSave} className={styles.saveButton}>
          Save Settings
        </button>
      </div>
    </div>
  );
} 