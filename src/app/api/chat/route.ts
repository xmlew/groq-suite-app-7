import { NextResponse } from 'next/server';
import { createChatCompletion } from '@/lib/groq-client';

export async function POST(request: Request) {
  try {
    const { messages, model } = await request.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }
    
    if (!model) {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 });
    }
    
    const completion = await createChatCompletion({
      messages,
      model,
      temperature: 0.7,
    });
    
    return NextResponse.json({
      content: completion.choices[0]?.message?.content || '',
      model: completion.model,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred during chat completion' },
      { status: 500 }
    );
  }
}
