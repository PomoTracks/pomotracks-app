import { useState } from 'react';
import { Topic } from '../services/api';
import styles from './TopicManager.module.css';

interface TopicManagerProps {
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
  selectedTopicId: string | null;
  setSelectedTopicId: (id: string | null) => void;
  onCreateTopic: (name: string, type: string) => Promise<void>;
  onRefreshTopics: () => Promise<void>;
}

export function TopicManager({
  topics,
  isLoading,
  error,
  selectedTopicId,
  setSelectedTopicId,
  onCreateTopic,
  onRefreshTopics,
}: TopicManagerProps) {
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicType, setNewTopicType] = useState('');

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTopicName.trim() || !newTopicType.trim()) {
      return;
    }

    await onCreateTopic(newTopicName, newTopicType);
    setNewTopicName('');
    setNewTopicType('');
  };

  return (
    <div className={styles.topicManagerCard}>
      <h2 style={{marginBottom: '1rem'}}>Topic Manager</h2>
      
      <form onSubmit={handleCreateTopic} className={styles.form}>
        <input
          type="text"
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
          placeholder="Enter topic name"
        />
        
        <input
          type="text"
          value={newTopicType}
          onChange={(e) => setNewTopicType(e.target.value)}
          placeholder="Enter topic type"
        />

        <button
          type="submit"
          disabled={isLoading || !newTopicName.trim()}
        >
          {isLoading ? 'Creating...' : 'Create Topic'}
        </button>
      </form>

      {error && (
        <div className="text-red-500">
          {error}
        </div>
      )}

      <div>
        <h3 style={{margin: '1.5rem 0 1rem 0'}}>Topics List</h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : topics.length === 0 ? (
          <p>No topics found</p>
        ) : (
          <ul className={styles.list}>
            {topics.map((topic) => (
              <li
                key={topic.id}
                className={`${styles.listItem} ${topic.id === selectedTopicId ? styles.active : ''}`}
                onClick={() => setSelectedTopicId(topic.id)}
              >
                <span>{topic.name}</span>
                <span>{topic.type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 