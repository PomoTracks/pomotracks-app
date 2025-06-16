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
    getProgressData()
      .then(res => setData(res ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const chartData = {
    labels: data.map(d => d.TopicName),
    datasets: [
      {
        label: 'Total Minutes',
        data: data.map(d => d.TotalMinutes),
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
      },
      x: {
        title: { display: true, text: 'Topic' },
      },
    },
  };

  return (
    <div className={styles.progressCard}>
      <h2 style={{marginBottom: '1rem'}}>Progress Tracker</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {!loading && !error && data.length === 0 && <p>No progress data yet.</p>}
      {!loading && !error && data.length > 0 && (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
} 