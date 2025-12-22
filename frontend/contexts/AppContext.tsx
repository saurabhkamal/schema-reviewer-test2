'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { schemaApi } from '@/lib/api';
import { useAuth } from './AuthContext';
import type { Database } from '@/types';

interface AppContextType {
  databases: Database[];
  selectedDatabaseId: string | null;
  setSelectedDatabaseId: (id: string | null) => void;
  refreshDatabases: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const refreshDatabases = async () => {
    if (!isAuthenticated) return;
    try {
      const snapshots = await schemaApi.getAll();
      const uniqueDbs = new Map<string, Database>();
      
      // Handle both direct array and paginated response
      const snapshotArray = Array.isArray(snapshots) 
        ? snapshots 
        : (snapshots?.data && Array.isArray(snapshots.data) ? snapshots.data : []);
      
      console.log('Refresh databases - snapshots:', snapshots);
      console.log('Refresh databases - snapshotArray:', snapshotArray);
      
      if (snapshotArray.length > 0) {
        snapshotArray.forEach((snapshot: any) => {
          console.log('Processing snapshot:', snapshot);
          if (snapshot && snapshot.databaseName) {
            if (!uniqueDbs.has(snapshot.databaseName)) {
              uniqueDbs.set(snapshot.databaseName, {
                id: snapshot.databaseName,
                name: snapshot.databaseName,
                type: 'postgresql',
                connectionStatus: 'connected',
                tablesCount: snapshot.tablesCount || 0,
              });
            } else {
              // Update tables count if we have a newer snapshot
              const existing = uniqueDbs.get(snapshot.databaseName);
              if (existing && (snapshot.tablesCount || 0) > (existing.tablesCount || 0)) {
                existing.tablesCount = snapshot.tablesCount || 0;
              }
            }
          }
        });
      }
      
      const dbList = Array.from(uniqueDbs.values());
      console.log('Refresh databases - dbList:', dbList);
      setDatabases(dbList);
      
      // Auto-select first database if none selected, or if selected database no longer exists
      if (dbList.length > 0) {
        const selectedExists = selectedDatabaseId && dbList.some(db => db.id === selectedDatabaseId);
        if (!selectedDatabaseId || !selectedExists) {
          setSelectedDatabaseId(dbList[0].id);
        }
      } else {
        // Clear selection if no databases
        setSelectedDatabaseId(null);
      }
    } catch (error) {
      console.error('Failed to fetch databases:', error);
      console.error('Error details:', error);
      setDatabases([]);
      setSelectedDatabaseId(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshDatabases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <AppContext.Provider
      value={{
        databases,
        selectedDatabaseId,
        setSelectedDatabaseId,
        refreshDatabases,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

