import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getProgressData, ProgressData } from '../services/api';
import styles from './ProgressTracker.module.css';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProgressTracker() {
  const [data, setData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progressData = await getProgressData();
        // Filter out any invalid entries
        const validData = progressData.filter(
          item => item.topicName && item.totalMinutes > 0
        );
        setData(validData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch progress data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const chartData = {
    labels: data.map(d => d.topicName),
    datasets: [
      {
        label: 'Total Minutes',
        data: data.map(d => d.totalMinutes),
        backgroundColor: 'rgba(0, 123, 255, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Total Minutes per Topic',
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Minutes' },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        title: { display: true, text: 'Topic' },
      },
    },
  };

  return (
    <div className={styles.progressCard}>
      <h2>Progress Tracker</h2>
      {loading && <p>Loading progress data...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className={styles.noData}>No progress data available yet. Complete some sessions to see your progress!</p>
      )}
      {!loading && !error && data.length > 0 && (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
} 