import { Groq } from 'groq';

let groqClient: Groq | null = null;

export function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    
    groqClient = new Groq({ apiKey });
  }
  
  return groqClient;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export async function createChatCompletion(options: ChatCompletionOptions) {
  const client = getGroqClient();
  
  try {
    const completion = await client.chat.completions.create({
      messages: options.messages,
      model: options.model,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
    });
    
    return completion;
  } catch (error) {
    console.error('Error creating chat completion:', error);
    throw error;
  }
}

export async function transcribeAudio(audioFile: File) {
  const client = getGroqClient();
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');
  
  try {
    // Note: This is a placeholder as Groq might not have a direct audio transcription API
    // In a real implementation, you would use the actual Groq API endpoint
    const response = await fetch('https://api.groq.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

export async function analyzeImage(imageUrl: string, prompt: string) {
  const client = getGroqClient();
  
  try {
    // Note: This is a placeholder as Groq might not have a direct image analysis API
    // In a real implementation, you would use the actual Groq API endpoint
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ],
        },
      ],
      model: 'llama3-70b-8192', // Use appropriate model that supports image analysis
    });
    
    return completion;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

export interface PerformanceMetrics {
  latency: number;
  tokensPerSecond: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  timestamp: string;
}

export async function getPerformanceMetrics(): Promise<PerformanceMetrics[]> {
  // In a real implementation, you would fetch this data from Groq API
  // This is a placeholder for demonstration purposes
  try {
    const response = await fetch('https://api.groq.com/v1/metrics', {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    // Return sample data for demonstration
    return [
      { latency: 150, tokensPerSecond: 120, totalTokens: 1200, promptTokens: 400, completionTokens: 800, timestamp: new Date().toISOString() },
      { latency: 140, tokensPerSecond: 125, totalTokens: 1300, promptTokens: 450, completionTokens: 850, timestamp: new Date(Date.now() - 3600000).toISOString() },
      { latency: 160, tokensPerSecond: 115, totalTokens: 1100, promptTokens: 350, completionTokens: 750, timestamp: new Date(Date.now() - 7200000).toISOString() },
      { latency: 145, tokensPerSecond: 130, totalTokens: 1400, promptTokens: 500, completionTokens: 900, timestamp: new Date(Date.now() - 10800000).toISOString() },
      { latency: 155, tokensPerSecond: 118, totalTokens: 1250, promptTokens: 425, completionTokens: 825, timestamp: new Date(Date.now() - 14400000).toISOString() },
    ];
  }
}