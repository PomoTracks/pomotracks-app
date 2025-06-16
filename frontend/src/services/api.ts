export interface Topic {
    id: string;
    name: string;
    type: string;
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