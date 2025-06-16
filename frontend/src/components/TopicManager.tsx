import { useState, useEffect } from 'react';
import { Topic, getTopics, createTopic } from '../services/api';

export function TopicManager() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [newTopicName, setNewTopicName] = useState('');
    const [newTopicType, setNewTopicType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const fetchedTopics = await getTopics();
            setTopics(fetchedTopics);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch topics');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newTopicName.trim() || !newTopicType.trim()) {
            setError('Name and type are required');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            await createTopic(newTopicName, newTopicType);
            setNewTopicName('');
            setNewTopicType('');
            await fetchTopics();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create topic');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Topic Manager</h2>
            
            <form onSubmit={handleCreateTopic} className="mb-6 space-y-4">
                <div>
                    <label htmlFor="topicName" className="block text-sm font-medium mb-1">
                        Topic Name
                    </label>
                    <input
                        type="text"
                        id="topicName"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter topic name"
                    />
                </div>
                
                <div>
                    <label htmlFor="topicType" className="block text-sm font-medium mb-1">
                        Topic Type
                    </label>
                    <input
                        type="text"
                        id="topicType"
                        value={newTopicType}
                        onChange={(e) => setNewTopicType(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter topic type"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {isLoading ? 'Creating...' : 'Create Topic'}
                </button>
            </form>

            {error && (
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}

            <div>
                <h3 className="text-xl font-semibold mb-2">Topics List</h3>
                {isLoading ? (
                    <p>Loading...</p>
                ) : topics.length === 0 ? (
                    <p>No topics found</p>
                ) : (
                    <ul className="space-y-2">
                        {topics.map((topic) => (
                            <li
                                key={topic.id}
                                className="p-3 border rounded hover:bg-gray-50"
                            >
                                <div className="font-medium">{topic.name}</div>
                                <div className="text-sm text-gray-600">{topic.type}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
} 