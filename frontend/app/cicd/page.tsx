'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTerminal, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const githubActionsExample = `name: Schema Analysis

on:
  pull_request:
    branches: [main]

jobs:
  analyze-schema:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Extract Schema
        run: |
          node scripts/extract-schema.js
      
      - name: Analyze Schema
        run: |
          curl -X POST $API_URL/api/v1/schema/ingest \\
            -H "Authorization: Bearer $API_TOKEN" \\
            -H "Content-Type: application/json" \\
            -d @schema.json
      
      - name: Check Issues
        run: |
          # Fail if critical issues found
          curl $API_URL/api/v1/impact/rank/$SNAPSHOT_ID?limit=1 \\
            -H "Authorization: Bearer $API_TOKEN"`;

const gitlabCIExample = `.schema_analysis:
  stage: test
  script:
    - node scripts/extract-schema.js
    - |
      curl -X POST $API_URL/api/v1/schema/ingest \\
        -H "Authorization: Bearer $API_TOKEN" \\
        -H "Content-Type: application/json" \\
        -d @schema.json`;

export default function CICDPage() {
  return (
    <AppLayout breadcrumbs={[{ label: 'CI/CD Integration' }]}>
      <div className="flex-1 p-xl overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-xl">
          <section>
            <div className="flex items-center gap-3 mb-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faTerminal} className="text-primary text-2xl" />
              </div>
              <div>
                <h1 className="text-h1 text-text-primary">CI/CD Integration</h1>
                <p className="text-body-lg text-text-secondary mt-1">
                  Integrate schema analysis into your CI/CD pipeline
                </p>
              </div>
            </div>
          </section>

          <Card>
            <CardContent>
              <div className="flex items-start gap-3 mb-4">
                <FontAwesomeIcon icon={faInfoCircle} className="text-info text-xl mt-1" />
                <div>
                  <h3 className="text-h3 text-text-primary mb-2">How to Integrate</h3>
                  <p className="text-body text-text-secondary mb-4">
                    Add schema analysis to your CI/CD pipeline to automatically detect issues before deployment.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-body font-medium text-text-primary mb-2">GitHub Actions Example</h4>
                  <div className="bg-background p-4 rounded-md border border-border">
                    <pre className="font-mono text-code text-text-primary whitespace-pre-wrap overflow-x-auto">
                      {githubActionsExample}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-body font-medium text-text-primary mb-2">GitLab CI Example</h4>
                  <div className="bg-background p-4 rounded-md border border-border">
                    <pre className="font-mono text-code text-text-primary whitespace-pre-wrap overflow-x-auto">
                      {gitlabCIExample}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
