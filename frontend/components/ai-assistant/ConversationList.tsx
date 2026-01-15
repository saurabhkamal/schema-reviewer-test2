'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faTrash,
  faArchive,
  faInbox,
  faSpinner,
  faMessage,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { conversationApi } from '@/lib/api';
import type { Conversation } from '@/types';

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation | null) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await conversationApi.list({
        archived: showArchived,
        search: searchQuery || undefined,
        limit: showArchived ? 5 : 100,
      });
      setConversations(result.conversations);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [showArchived, searchQuery]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await conversationApi.delete(conversationId);
      if (selectedConversationId === conversationId) {
        onSelectConversation(null);
      }
      loadConversations();
    } catch (err: any) {
      console.error('Failed to delete conversation:', err);
      alert('Failed to delete conversation: ' + (err.message || 'Unknown error'));
    }
  };

  const handleArchive = async (e: React.MouseEvent, conversationId: string, archived: boolean) => {
    e.stopPropagation();
    try {
      await conversationApi.archive(conversationId, archived);
      loadConversations();
    } catch (err: any) {
      console.error('Failed to archive conversation:', err);
      alert('Failed to archive conversation: ' + (err.message || 'Unknown error'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-h3 text-text-primary font-semibold">Conversations</h2>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-sm"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface-light border border-border rounded-lg text-body-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <FontAwesomeIcon icon={faTimes} className="text-sm" />
            </button>
          )}
        </div>

        {/* Archive Toggle */}
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center gap-2 text-body-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <FontAwesomeIcon icon={showArchived ? faInbox : faArchive} className="text-xs" />
          {showArchived ? 'Show Active' : 'Show Archived'}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <FontAwesomeIcon icon={faSpinner} className="text-primary text-xl animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-body-sm text-warning">{error}</p>
            <button
              onClick={loadConversations}
              className="mt-2 text-body-sm text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center">
            <FontAwesomeIcon icon={faMessage} className="text-text-muted text-2xl mb-2" />
            <p className="text-body-sm text-text-muted">
              {showArchived ? 'No archived conversations' : 'No conversations yet'}
            </p>
            {!showArchived && (
              <button
                onClick={onNewConversation}
                className="mt-2 text-body-sm text-primary hover:underline"
              >
                Start a new conversation
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-3 cursor-pointer hover:bg-surface-light transition-colors ${
                  selectedConversationId === conversation.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-body-sm font-semibold text-text-primary line-clamp-1 flex-1">
                    {conversation.title}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleArchive(e, conversation.id, !conversation.archived)}
                      className="p-1 text-text-muted hover:text-text-primary transition-colors"
                      title={conversation.archived ? 'Unarchive' : 'Archive'}
                    >
                      <FontAwesomeIcon
                        icon={conversation.archived ? faInbox : faArchive}
                        className="text-xs"
                      />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, conversation.id)}
                      className="p-1 text-text-muted hover:text-warning transition-colors"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </div>
                </div>
                {conversation.preview && (
                  <p className="text-caption text-text-muted line-clamp-2 mb-1">
                    {conversation.preview}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-caption text-text-muted">
                    {formatDate(conversation.updatedAt)}
                  </p>
                  {conversation.databaseName && (
                    <span className="text-caption text-text-muted bg-surface-light px-1.5 py-0.5 rounded">
                      {conversation.databaseName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
