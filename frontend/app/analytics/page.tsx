'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useApp } from '@/contexts/AppContext';
import { schemaApi, impactApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function AnalyticsPage() {
  const { selectedDatabaseId } = useApp();

  const { data: snapshots } = useQuery({
    queryKey: ['snapshots', selectedDatabaseId],
    queryFn: () => schemaApi.getAll(selectedDatabaseId || undefined, 1, 20),
    enabled: !!selectedDatabaseId,
  });

  const snapshotsWithScores = snapshots?.data?.slice(0, 10) || [];

  return (
    <AppLayout breadcrumbs={[{ label: 'Analytics' }]}>
      <div className="flex-1 p-xl overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-xl">
          <section>
            <div className="flex items-center gap-3 mb-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faChartLine} className="text-primary text-2xl" />
              </div>
              <div>
                <h1 className="text-h1 text-text-primary">Analytics Dashboard</h1>
                <p className="text-body-lg text-text-secondary mt-1">
                  View schema health trends over time
                </p>
              </div>
            </div>
          </section>

          {selectedDatabaseId ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
                <Card>
                  <CardContent>
                    <p className="text-caption text-text-muted uppercase mb-2">Total Snapshots</p>
                    <p className="text-h2 text-text-primary">{snapshots?.data?.length || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <p className="text-caption text-text-muted uppercase mb-2">Total Tables</p>
                    <p className="text-h2 text-text-primary">
                      {snapshots?.data?.reduce((sum: number, s: any) => sum + (s.tablesCount || 0), 0) || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <p className="text-caption text-text-muted uppercase mb-2">Total Issues</p>
                    <p className="text-h2 text-text-primary">
                      {snapshots?.data?.reduce((sum: number, s: any) => sum + (s.issuesCount || 0), 0) || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent>
                  <h3 className="text-h3 text-text-primary mb-4">Recent Snapshots</h3>
                  {snapshotsWithScores.length > 0 ? (
                    <div className="space-y-2">
                      {snapshotsWithScores.map((snapshot: any) => (
                        <div
                          key={snapshot.id}
                          className="p-4 bg-surface-light rounded-md flex items-center justify-between"
                        >
                          <div>
                            <p className="text-body font-medium text-text-primary">
                              Version {snapshot.version}
                            </p>
                            <p className="text-body-sm text-text-muted">
                              {new Date(snapshot.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-caption text-text-muted">Tables</p>
                              <p className="text-body font-medium text-text-primary">
                                {snapshot.tablesCount || 0}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-caption text-text-muted">Issues</p>
                              <p className="text-body font-medium text-text-primary">
                                {snapshot.issuesCount || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body text-text-secondary text-center py-8">
                      No snapshots found. Ingest a schema to see analytics.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent>
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-info text-xl mt-1" />
                  <div>
                    <h3 className="text-h3 text-text-primary mb-2">No Database Selected</h3>
                    <p className="text-body text-text-secondary">
                      Please select a database from the sidebar to view analytics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
