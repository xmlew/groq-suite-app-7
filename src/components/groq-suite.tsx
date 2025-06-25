"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage, PerformanceMetrics } from '@/lib/groq-client';
import { MessageSquare, Mic, Image, Zap, FileSpreadsheet, FileText, Shield, BarChart3, Loader2 } from 'lucide-react';

export function GroqSuite() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama3-70b-8192');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], model: selectedModel }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from Groq API');
      }
      
      const data = await response.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.content };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to communicate with Groq API',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribeAudio = async () => {
    if (!audioFile) return;
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }
      
      const data = await response.json();
      toast({
        title: 'Transcription Complete',
        description: data.text,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to transcribe audio',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageUrl || !imagePrompt) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, prompt: imagePrompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const data = await response.json();
      toast({
        title: 'Image Analysis Complete',
        description: data.content,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceMetrics = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/metrics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch performance metrics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Groq-Suite</CardTitle>
          <CardDescription>
            A developer-focused superapp for interacting with Groq API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 mb-4">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden md:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="transcribe" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <span className="hidden md:inline">Transcribe</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span className="hidden md:inline">Image</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden md:inline">Tools</span>
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden md:inline">Batch</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="moderation" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Moderation</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2" onClick={fetchPerformanceMetrics}>
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Metrics</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llama3-70b-8192">LLaMA 3 70B</SelectItem>
                    <SelectItem value="llama3-8b-8192">LLaMA 3 8B</SelectItem>
                    <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <ScrollArea className="h-[400px] border rounded-md p-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Start a conversation with Groq AI
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </ScrollArea>
              
              <div className="flex gap-2">
                <Textarea 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Type your message here..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} disabled={loading || !input.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="transcribe" className="space-y-4">
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => e.target.files && setAudioFile(e.target.files[0])}
                  />
                </div>
                <Button onClick={handleTranscribeAudio} disabled={loading || !audioFile}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  Transcribe Audio
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="image" className="space-y-4">
              <div className="space-y-4">
                <Input
                  type="url"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Textarea
                  placeholder="What would you like to know about this image?"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                />
                <Button onClick={handleAnalyzeImage} disabled={loading || !imageUrl || !imagePrompt}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Image className="h-4 w-4 mr-2" />}
                  Analyze Image
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-4">
              <Button onClick={fetchPerformanceMetrics} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                Refresh Metrics
              </Button>
              
              {metrics.length > 0 && (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="latency" stroke="#8884d8" name="Latency (ms)" />
                      <Line type="monotone" dataKey="tokensPerSecond" stroke="#82ca9d" name="Tokens/sec" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tools">
              <div className="text-center text-muted-foreground py-8">
                Tool-augmented reasoning flows coming soon
              </div>
            </TabsContent>
            
            <TabsContent value="batch">
              <div className="text-center text-muted-foreground py-8">
                Batch processing coming soon
              </div>
            </TabsContent>
            
            <TabsContent value="templates">
              <div className="text-center text-muted-foreground py-8">
                Template management coming soon
              </div>
            </TabsContent>
            
            <TabsContent value="moderation">
              <div className="text-center text-muted-foreground py-8">
                Content moderation coming soon
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">Powered by Groq API</p>
        </CardFooter>
      </Card>
    </div>
  );
}