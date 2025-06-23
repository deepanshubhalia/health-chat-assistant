"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  agentName?: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! I\'m here to help you with your health and wellness questions. How are you feeling today?',
    isUser: false,
    agentName: 'Wellness Agent',
    timestamp: new Date()
  }
];

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when new message appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageToBackend = async (userMessage: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          agentType: 'auto' // Let backend detect the agent
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message to backend:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendMessageToBackend(inputValue);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response || 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
        isUser: false,
        agentName: response.agentName || 'Health Assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I\'m sorry, but I\'m having trouble connecting to my services right now. Please check your internet connection and try again.',
        isUser: false,
        agentName: 'System',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Health Assistant</h2>
          <p className="text-sm text-gray-600 mt-1">Your personal wellness companion</p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`w-fit max-w-[90%] break-words whitespace-pre-wrap ${message.isUser ? 'order-2' : 'order-1'}`}>
                {!message.isUser && message.agentName && (
                  <div className="text-xs text-gray-500 mb-1 ml-2 font-medium">
                    {message.agentName}
                  </div>
                )}
                <div
                  className={`
                    px-4 py-3 rounded-2xl shadow-sm
                    ${message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-4'
                      : 'bg-gradient-to-r from-green-50 to-green-100 text-gray-800 mr-4 border border-green-200'}
                  `}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-fit max-w-[90%] order-1">
                <div className="text-xs text-gray-500 mb-1 ml-2 font-medium">
                  Health Assistant
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 text-gray-800 mr-4 border border-green-200 px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-green-600 hover:bg-green-50"
            >
              <Smile className="h-5 w-5" />
            </Button>

            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your health question here..."
              className="flex-1 border-gray-200 focus:border-green-400 focus:ring-green-400"
              disabled={isLoading}
            />

            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
