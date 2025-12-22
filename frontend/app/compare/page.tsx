'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodeCompare, faArrowRight, faCheck, faTimes, faTrash, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useApp } from '@/contexts/AppContext';
import { schemaApi } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function ComparePage() {
  const { selectedDatabaseId, databases } = useApp();
  const queryClient = useQueryClient();
  const [snapshot1Id, setSnapshot1Id] = useState<string>('');
  const [snapshot2Id, setSnapshot2Id] = useState<string>('');
  const [showManageSnapshots, setShowManageSnapshots] = useState(false);
  const [deletingSnapshotId, setDeletingSnapshotId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const { data: snapshotsResponse, isLoading: snapshotsLoading } = useQuery({
    queryKey: ['snapshots', selectedDatabaseId],
    queryFn: () => schemaApi.getAll(selectedDatabaseId || undefined, 1, 50),
    enabled: !!selectedDatabaseId,
  });

  // Handle response - API client now returns proper PaginatedResponse { data: [...], pagination: {...} }
  // But also handle case where it might be an array directly (backward compatibility)
  const snapshots = Array.isArray(snapshotsResponse)
    ? snapshotsResponse
    : (snapshotsResponse?.data && Array.isArray(snapshotsResponse.data))
    ? snapshotsResponse.data
    : [];
  
  // Debug logging
  useEffect(() => {
    if (selectedDatabaseId) {
      console.log('Compare page - selectedDatabaseId:', selectedDatabaseId);
      console.log('Compare page - snapshotsResponse:', snapshotsResponse);
      console.log('Compare page - snapshots:', snapshots);
      console.log('Compare page - snapshots.length:', snapshots.length);
    }
  }, [selectedDatabaseId, snapshotsResponse, snapshots]);

  const [shouldCompare, setShouldCompare] = useState(false);

  const { data: comparison, isLoading: comparing } = useQuery({
    queryKey: ['compare', snapshot1Id, snapshot2Id],
    queryFn: () => schemaApi.compare(snapshot1Id, snapshot2Id),
    enabled: shouldCompare && !!snapshot1Id && !!snapshot2Id,
  });

  const handleCompare = () => {
    if (snapshot1Id && snapshot2Id && snapshot1Id !== snapshot2Id) {
      setShouldCompare(true);
    } else if (snapshot1Id === snapshot2Id && snapshot1Id) {
      alert('Please select two different snapshots to compare');
    }
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (!confirm(`Are you sure you want to delete this snapshot? This action cannot be undone.`)) {
      return;
    }

    setDeletingSnapshotId(snapshotId);
    try {
      await schemaApi.deleteSnapshot(snapshotId);
      // Clear selected snapshots if they were deleted
      if (snapshot1Id === snapshotId) setSnapshot1Id('');
      if (snapshot2Id === snapshotId) setSnapshot2Id('');
      // Refresh snapshots list
      queryClient.invalidateQueries({ queryKey: ['snapshots', selectedDatabaseId] });
      alert('Snapshot deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete snapshot');
    } finally {
      setDeletingSnapshotId(null);
    }
  };

  const handleDeleteAll = async () => {
    const confirmMessage = selectedDatabaseId
      ? `Are you sure you want to delete ALL snapshots for "${selectedDatabaseId}"? This action cannot be undone.`
      : `Are you sure you want to delete ALL snapshots? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingAll(true);
    try {
      const result = await schemaApi.deleteAllSnapshots(selectedDatabaseId || undefined);
      setSnapshot1Id('');
      setSnapshot2Id('');
      queryClient.invalidateQueries({ queryKey: ['snapshots', selectedDatabaseId] });
      alert(`Successfully deleted ${result.deletedCount} snapshot(s)`);
      setShowManageSnapshots(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete snapshots');
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Schema Comparison' }]}>
      <div className="flex-1 p-xl overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-xl">
          <section>
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faCodeCompare} className="text-primary text-2xl" />
                </div>
                <div>
                  <h1 className="text-h1 text-text-primary">Schema Comparison</h1>
                  <p className="text-body-lg text-text-secondary mt-1">
                    Compare schemas between snapshots to identify differences
                  </p>
                </div>
              </div>
              {selectedDatabaseId && snapshots && Array.isArray(snapshots) && snapshots.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManageSnapshots(!showManageSnapshots)}
                  icon={faTrashCan}
                >
                  {showManageSnapshots ? 'Hide' : 'Manage'} Snapshots
                </Button>
              )}
            </div>
          </section>

          {showManageSnapshots && selectedDatabaseId && snapshots && Array.isArray(snapshots) && snapshots.length > 0 && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-h3 text-text-primary">Manage Snapshots</h3>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteAll}
                    isLoading={deletingAll}
                    icon={faTrash}
                  >
                    Delete All Snapshots
                  </Button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {snapshots.map((snapshot: any) => {
                    const id = snapshot.id || snapshot.snapshotId;
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-3 bg-surface-light rounded-md border border-border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-body font-medium text-text-primary">
                              Version {snapshot.version}
                            </span>
                            <span className="text-body-sm text-text-muted">
                              {new Date(snapshot.createdAt).toLocaleString()}
                            </span>
                            <span className="text-body-sm text-text-secondary">
                              {snapshot.tablesCount || 0} tables
                            </span>
                          </div>
                          <p className="text-body-sm text-text-muted mt-1 font-mono">
                            {id}
                          </p>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteSnapshot(id)}
                          isLoading={deletingSnapshotId === id}
                          icon={faTrash}
                        >
                          Delete
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <div className="space-y-6">
                {selectedDatabaseId && snapshots && Array.isArray(snapshots) && snapshots.length >= 2 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-body-sm font-medium text-text-primary mb-2">
                        Snapshot 1
                      </label>
                      <select
                        value={snapshot1Id}
                        onChange={(e) => setSnapshot1Id(e.target.value)}
                        className="w-full h-10 px-3 bg-surface-light border border-border rounded-md text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select snapshot...</option>
                        {snapshots.map((snapshot: any) => {
                          const id = snapshot.id || snapshot.snapshotId;
                          return (
                            <option key={id} value={id}>
                              Version {snapshot.version} - {new Date(snapshot.createdAt).toLocaleDateString()}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-body-sm font-medium text-text-primary mb-2">
                        Snapshot 2
                      </label>
                      <select
                        value={snapshot2Id}
                        onChange={(e) => setSnapshot2Id(e.target.value)}
                        className="w-full h-10 px-3 bg-surface-light border border-border rounded-md text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select snapshot...</option>
                        {snapshots.map((snapshot: any) => {
                          const id = snapshot.id || snapshot.snapshotId;
                          return (
                            <option key={id} value={id}>
                              Version {snapshot.version} - {new Date(snapshot.createdAt).toLocaleDateString()}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-body-sm text-text-muted">
                      {!selectedDatabaseId 
                        ? 'Select a database first'
                        : snapshotsLoading
                        ? 'Loading snapshots...'
                        : snapshots && Array.isArray(snapshots) && snapshots.length > 0 && snapshots.length < 2
                        ? `You need at least 2 snapshots. Currently have ${snapshots.length}.`
                        : 'No snapshots found'}
                    </p>
                  </div>
                )}
                {selectedDatabaseId && snapshots && Array.isArray(snapshots) && snapshots.length >= 2 && (
                  <Button
                    variant="primary"
                    onClick={handleCompare}
                    isLoading={comparing}
                    disabled={!snapshot1Id || !snapshot2Id || snapshot1Id === snapshot2Id}
                    icon={faCodeCompare}
                  >
                    Compare Schemas
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {comparison && (
            <div className="space-y-4">
              {comparison.addedTables && comparison.addedTables.length > 0 && (
                <Card>
                  <CardContent>
                    <h3 className="text-h3 text-text-primary mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheck} className="text-success" />
                      Added Tables ({comparison.addedTables.length})
                    </h3>
                    <div className="space-y-2">
                      {comparison.addedTables.map((table: string) => (
                        <div key={table} className="p-2 bg-success/10 rounded-md text-body text-text-primary">
                          {table}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {comparison.removedTables && comparison.removedTables.length > 0 && (
                <Card>
                  <CardContent>
                    <h3 className="text-h3 text-text-primary mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faTimes} className="text-error" />
                      Removed Tables ({comparison.removedTables.length})
                    </h3>
                    <div className="space-y-2">
                      {comparison.removedTables.map((table: string) => (
                        <div key={table} className="p-2 bg-error/10 rounded-md text-body text-text-primary">
                          {table}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {comparison.tableDiffs && comparison.tableDiffs.length > 0 && (
                <Card>
                  <CardContent>
                    <h3 className="text-h3 text-text-primary mb-4">Table Differences</h3>
                    <div className="space-y-4">
                      {comparison.tableDiffs.map((diff: any, idx: number) => (
                        <div key={idx} className="p-4 bg-surface-light rounded-md">
                          <h4 className="text-body font-medium text-text-primary mb-2">{diff.tableName}</h4>
                          {diff.addedColumns && diff.addedColumns.length > 0 && (
                            <div className="mb-2">
                              <span className="text-body-sm text-success">Added columns: </span>
                              <span className="text-body-sm text-text-secondary">{diff.addedColumns.join(', ')}</span>
                            </div>
                          )}
                          {diff.removedColumns && diff.removedColumns.length > 0 && (
                            <div className="mb-2">
                              <span className="text-body-sm text-error">Removed columns: </span>
                              <span className="text-body-sm text-text-secondary">{diff.removedColumns.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(!comparison.addedTables || comparison.addedTables.length === 0) &&
                (!comparison.removedTables || comparison.removedTables.length === 0) &&
                (!comparison.tableDiffs || comparison.tableDiffs.length === 0) && (
                  <Card>
                    <CardContent>
                      <p className="text-body text-text-secondary text-center py-8">
                        No differences found between the two snapshots.
                      </p>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}

          {!selectedDatabaseId && (
            <Card>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-body text-text-secondary mb-4">
                    {databases.length > 0 
                      ? 'Please select a database from the sidebar to compare snapshots.'
                      : 'No databases found. Please ingest a schema first.'}
                  </p>
                  {databases.length === 0 && (
                    <Button variant="primary" onClick={() => window.location.href = '/databases'}>
                      Go to Databases
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedDatabaseId && snapshots && Array.isArray(snapshots) && snapshots.length < 2 && !snapshotsLoading && (
            <Card>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-body text-text-secondary mb-4">
                    You need at least 2 snapshots to compare. Currently you have {snapshots.length} snapshot(s).
                  </p>
                  <p className="text-body-sm text-text-muted mb-4">
                    Ingest the same database schema again to create version 2, then you can compare versions.
                  </p>
                  <Button variant="primary" onClick={() => window.location.href = '/databases'}>
                    Ingest Schema Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
