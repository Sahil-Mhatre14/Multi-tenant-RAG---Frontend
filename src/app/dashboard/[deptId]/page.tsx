'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { CorpusFile } from '@/types';
import FileTable from '@/components/FileTable';
import UploadPanel from '@/components/UploadPanel';

export default function DeptDashboardPage({
  params,
}: {
  params: Promise<{ deptId: string }>;
}) {
  const { deptId } = use(params);
  const [files, setFiles] = useState<CorpusFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFiles = useCallback(() => {
    setLoading(true);
    api
      .listFiles(deptId)
      .then((data) => {
        setFiles(data.files);
        setError('');
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [deptId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/dashboard"
        className="text-sm text-sjsu-blue hover:underline mb-4 inline-block"
      >
        ← Back to Dashboard
      </Link>

      {/* Page header with gold accent */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-1 h-8 bg-sjsu-gold rounded-full" />
        <h1 className="text-2xl font-bold text-gray-900">
          {deptId.toUpperCase()} Knowledge Base
        </h1>
      </div>
      <p className="text-sjsu-gray text-sm mb-8 ml-4">
        Upload and manage documents for this department&apos;s RAG corpus.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* File list */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              Indexed Files
            </h2>
            <button
              onClick={loadFiles}
              className="text-xs text-sjsu-blue hover:underline"
            >
              Refresh
            </button>
          </div>
          <FileTable
            files={files}
            loading={loading}
            error={error}
            deptId={deptId}
            onDeleted={loadFiles}
          />
        </div>

        {/* Upload panel */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Upload Content
          </h2>
          <UploadPanel deptId={deptId} onUploaded={loadFiles} />
        </div>
      </div>
    </div>
  );
}
