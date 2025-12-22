'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faPaperPlane,
  faRobot,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useApp } from '@/contexts/AppContext';
import { assistantApi } from '@/lib/api';
import type { Message } from '@/types';

export default function AIAssistantPage() {
  const { selectedDatabaseId, databases } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState<string>(`conv-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedDatabase = databases.find((db) => db.id === selectedDatabaseId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
    setMessage('');
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      role: 'user',
      content: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await assistantApi.sendMessage(
        userMessage.content,
        selectedDatabase?.name,
        conversationId
      );
      setMessages((prev) => [...prev, response]);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `msg-error-${Date.now()}`,
        conversationId,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'AI Assistant' }]}>
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="p-lg border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faRobot} className="text-primary text-lg" />
            </div>
            <div>
              <h1 className="text-h2 text-text-primary">AI Assistant</h1>
              <p className="text-body-sm text-text-secondary">
                {selectedDatabase
                  ? `Helping with: ${selectedDatabase.name}`
                  : 'Select a database to get contextual help'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleNewChat} icon={faPlus}>
            New Chat
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-lg">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faRobot} className="text-primary text-2xl" />
                </div>
                <h2 className="text-h3 text-text-primary mb-2">Ask me anything about your schema</h2>
                <p className="text-body text-text-secondary mb-6">
                  I can help you with performance optimization, indexing strategies, schema design, and more.
                </p>
                <div className="space-y-2 text-left">
                  <p className="text-body-sm text-text-muted">Try asking:</p>
                  <ul className="text-body-sm text-text-secondary space-y-1">
                    <li>• "How can I optimize my database?"</li>
                    <li>• "What indexes do I need?"</li>
                    <li>• "Explain foreign key relationships"</li>
                    <li>• "Why is my table slow?"</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <FontAwesomeIcon icon={faRobot} className="text-white text-sm" />
                    </div>
                  )}
                  <div
                    className={`flex-1 max-w-3xl ${
                      msg.role === 'user' ? 'flex justify-end' : ''
                    }`}
                  >
                    <div
                      className={`p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-surface-light border border-border rounded-tl-none'
                      }`}
                    >
                      <p
                        className={`text-body whitespace-pre-wrap ${
                          msg.role === 'user' ? 'text-white' : 'text-text-primary'
                        }`}
                      >
                        {msg.content}
                      </p>
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.recommendations.map((rec, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded text-body-sm ${
                                msg.role === 'user'
                                  ? 'bg-white/20 text-white'
                                  : 'bg-surface border border-border text-text-secondary'
                              }`}
                            >
                              • {rec}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-caption text-text-muted mt-1 px-2">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <FontAwesomeIcon icon={faUser} className="text-primary text-sm" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <FontAwesomeIcon icon={faRobot} className="text-white text-sm" />
                  </div>
                  <div className="bg-surface-light border border-border rounded-lg rounded-tl-none p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-lg border-t border-border bg-surface">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask about your schema..."
                className="flex-1 h-11 pl-4 pr-12 bg-surface-light border border-border rounded-lg text-body text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                isLoading={isLoading}
                icon={faPaperPlane}
                className="absolute right-2"
                size="sm"
              >
                Send
              </Button>
            </div>
            {!selectedDatabase && (
              <p className="text-caption text-text-muted mt-2 text-center">
                Select a database from the sidebar for contextual assistance
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
