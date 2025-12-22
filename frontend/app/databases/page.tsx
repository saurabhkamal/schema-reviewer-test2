'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDatabase,
  faUpload,
  faCheck,
  faTimes,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { schemaApi } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import { useQueryClient } from '@tanstack/react-query';

export default function DatabasesPage() {
  const { refreshDatabases, setSelectedDatabaseId } = useApp();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    databaseName: '',
    databaseType: 'postgresql' as 'postgresql' | 'mysql' | 'sqlite' | 'mssql',
    schemaJson: '',
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const json = JSON.parse(content);
          setFormData((prev) => ({
            ...prev,
            schemaJson: content,
            databaseName: json.databaseName || prev.databaseName,
            databaseType: json.databaseType || prev.databaseType,
          }));
        } catch (error) {
          setUploadError('Invalid JSON file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(true);

    try {
      let schemaData;
      if (formData.schemaJson) {
        schemaData = JSON.parse(formData.schemaJson);
      } else {
        throw new Error('Please provide schema data');
      }

      const result = await schemaApi.ingest(schemaData);
      setUploadSuccess(true);
      setFormData({
        databaseName: '',
        databaseType: 'postgresql',
        schemaJson: '',
      });
      
      // Invalidate React Query cache to force refresh
      queryClient.invalidateQueries({ queryKey: ['snapshots'] });
      
      // Wait a bit for backend to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh databases and select the newly ingested one
      await refreshDatabases();
      
      // Auto-select the database that was just ingested
      if (schemaData.databaseName) {
        // Wait for state to update, then select
        setTimeout(() => {
          setSelectedDatabaseId(schemaData.databaseName);
        }, 300);
      }
      
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
      let errorMessage = 'Failed to ingest schema. Please check your data format.';
      
      if (error.response?.status === 403) {
        errorMessage = 'Permission denied. You need ADMIN or DEVELOPER role to ingest schemas. Please contact an administrator or register with a DEVELOPER role.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Database Connections' }]}>
      <div className="flex-1 p-xl overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-xl">
          {/* Header */}
          <section>
            <div className="flex items-center gap-3 mb-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faDatabase} className="text-primary text-2xl" />
              </div>
              <div>
                <h1 className="text-h1 text-text-primary">Add Database Schema</h1>
                <p className="text-body-lg text-text-secondary mt-1">
                  Upload your database schema metadata to start analysis
                </p>
              </div>
            </div>
          </section>

          {/* Info Card */}
          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faInfoCircle} className="text-info text-xl mt-1" />
                <div>
                  <h3 className="text-h3 text-text-primary mb-2">How to Add Your Database</h3>
                  <p className="text-body text-text-secondary mb-3">
                    This system analyzes schema metadata, not direct database connections. You need to extract your
                    database schema using a scanner tool and upload the JSON metadata.
                  </p>
                  <div className="space-y-2 text-body-sm text-text-secondary">
                    <p>
                      <strong>Step 1:</strong> Use a schema scanner to extract metadata from your PostgreSQL database
                    </p>
                    <p>
                      <strong>Step 2:</strong> Export the schema as JSON in the required format
                    </p>
                    <p>
                      <strong>Step 3:</strong> Upload the JSON file or paste the JSON data below
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Form */}
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Database Name */}
                <div>
                  <label htmlFor="databaseName" className="block text-body-sm font-medium text-text-primary mb-2">
                    Database Name *
                  </label>
                  <input
                    type="text"
                    id="databaseName"
                    required
                    value={formData.databaseName}
                    onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                    className="w-full h-10 px-3 bg-surface-light border border-border rounded-md text-body text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Production DB"
                  />
                </div>

                {/* Database Type */}
                <div>
                  <label htmlFor="databaseType" className="block text-body-sm font-medium text-text-primary mb-2">
                    Database Type *
                  </label>
                  <select
                    id="databaseType"
                    required
                    value={formData.databaseType}
                    onChange={(e) =>
                      setFormData({ ...formData, databaseType: e.target.value as any })
                    }
                    className="w-full h-10 px-3 bg-surface-light border border-border rounded-md text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="sqlite">SQLite</option>
                    <option value="mssql">Microsoft SQL Server</option>
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-body-sm font-medium text-text-primary mb-2">
                    Schema JSON File
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="w-full h-32 border-2 border-dashed border-border rounded-md flex items-center justify-center hover:border-primary transition-colors">
                        <div className="text-center">
                          <FontAwesomeIcon icon={faUpload} className="text-text-muted text-2xl mb-2" />
                          <p className="text-body text-text-secondary">Click to upload JSON file</p>
                          <p className="text-body-sm text-text-muted mt-1">or paste JSON below</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* JSON Input */}
                <div>
                  <label htmlFor="schemaJson" className="block text-body-sm font-medium text-text-primary mb-2">
                    Schema JSON Data *
                  </label>
                  <textarea
                    id="schemaJson"
                    required
                    value={formData.schemaJson}
                    onChange={(e) => setFormData({ ...formData, schemaJson: e.target.value })}
                    className="w-full h-64 px-4 py-3 bg-surface-light border border-border rounded-md text-body font-mono text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder='{"databaseName": "mydb", "databaseType": "postgresql", "tables": [...]}'
                  />
                </div>

                {/* Success Message */}
                {uploadSuccess && (
                  <div className="bg-success/20 border border-success/50 text-success text-body-sm p-3 rounded-md flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Schema ingested successfully! You can now view it in the Schemas page.</span>
                  </div>
                )}

                {/* Error Message */}
                {uploadError && (
                  <div className="bg-error/20 border border-error/50 text-error text-body-sm p-3 rounded-md flex items-center gap-2">
                    <FontAwesomeIcon icon={faTimes} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isUploading}
                  icon={faUpload}
                >
                  {isUploading ? 'Uploading...' : 'Ingest Schema'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Example Format */}
          <Card>
            <CardContent>
              <h3 className="text-h3 text-text-primary mb-4">Expected JSON Format</h3>
              <div className="bg-background p-4 rounded-md border border-border">
                <pre className="font-mono text-code text-text-primary whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(
                    {
                      databaseName: 'example_db',
                      databaseType: 'postgresql',
                      tables: [
                        {
                          name: 'users',
                          schemaName: 'public',
                          rowCount: 1000,
                          sizeBytes: 1048576,
                          sizeFormatted: '1 MB',
                          columns: [
                            {
                              name: 'id',
                              type: 'bigint',
                              nullable: false,
                              defaultValue: null,
                              isPrimaryKey: true,
                              isForeignKey: false,
                            },
                            {
                              name: 'email',
                              type: 'varchar(255)',
                              nullable: false,
                              defaultValue: null,
                              isPrimaryKey: false,
                              isForeignKey: false,
                            },
                          ],
                          indexes: [
                            {
                              name: 'idx_users_email',
                              columns: ['email'],
                              unique: true,
                              type: 'btree',
                            },
                          ],
                          foreignKeys: [],
                        },
                      ],
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

