export interface Topic {
    id: string;
    name: string;
    type: string;
}

export interface Session {
    id: string;
    topicId: string;
    durationSeconds: number;
    completedAt: string;
}

export interface ProgressData {
    topicName: string;
    totalMinutes: number;
}

const API_BASE_URL = 'http://localhost:8080/api/v1';

export async function getTopics(): Promise<Topic[]> {
    const response = await fetch(`${API_BASE_URL}/topics`);
    if (!response.ok) {
        throw new Error('Failed to fetch topics');
    }
    return response.json();
}

export async function createTopic(name: string, type: string): Promise<Topic> {
    const response = await fetch(`${API_BASE_URL}/topics`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type }),
    });
    
    if (!response.ok) {
        throw new Error('Failed to create topic');
    }
    
    return response.json();
}

export async function createSession(topicId: string, durationSeconds: number): Promise<Session> {
    console.log('API: Creating session with:', { topicId, durationSeconds });
    
    const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            topicId, 
            durationSeconds 
        }),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create session');
    }
    
    const data = await response.json();
    console.log('API: Session created:', data);
    return data;
}

export async function getProgressData(): Promise<ProgressData[]> {
    const response = await fetch(`${API_BASE_URL}/progress`);
    if (!response.ok) {
        throw new Error('Failed to fetch progress data');
    }
    return response.json();
} 