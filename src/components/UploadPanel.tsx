'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';

type Tab = 'url' | 'batch' | 'file';

interface StatusMsg {
  type: 'success' | 'error';
  text: string;
}

interface Props {
  deptId: string;
  onUploaded: () => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'url', label: 'URL' },
  { id: 'batch', label: 'Batch URLs' },
  { id: 'file', label: 'File Upload' },
];

export default function UploadPanel({ deptId, onUploaded }: Props) {
  const [tab, setTab] = useState<Tab>('url');
  const [url, setUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<StatusMsg | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (type: StatusMsg['type'], text: string) => {
    setStatus({ type, text });
    setTimeout(() => setStatus(null), 6000);
  };

  const handleUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await api.ingestUrl({ url: url.trim(), dept_id: deptId });
      if (res.success) {
        showStatus(
          'success',
          `Ingested: "${res.title ?? url}"${res.word_count ? ` (${res.word_count} words)` : ''}`
        );
        setUrl('');
        onUploaded();
      } else {
        showStatus('error', res.message);
      }
    } catch (e) {
      showStatus('error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatch = async () => {
    const urls = batchUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);
    if (!urls.length) return;
    setLoading(true);
    try {
      const res = await api.ingestUrls({ urls, dept_id: deptId });
      const msg = `${res.successful.length}/${res.total} URLs ingested${
        res.failed.length ? `, ${res.failed.length} failed` : ''
      }.`;
      showStatus(
        res.failed.length === res.total ? 'error' : 'success',
        msg
      );
      if (res.successful.length) {
        setBatchUrls('');
        onUploaded();
      }
    } catch (e) {
      showStatus('error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const res = await api.ingestFile(file, deptId);
      showStatus('success', res.message);
      onUploaded();
    } catch (e) {
      showStatus('error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const batchCount = batchUrls.split('\n').filter((u) => u.trim()).length;

  return (
    <div className="bg-white rounded-xl border p-4">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 bg-sjsu-blue-muted rounded-lg p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
              tab === t.id
                ? 'bg-white text-sjsu-blue shadow-sm'
                : 'text-sjsu-gray hover:text-sjsu-blue'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* URL tab */}
      {tab === 'url' && (
        <div className="space-y-3">
          <input
            type="url"
            placeholder="https://example.com/page"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrl()}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sjsu-blue"
          />
          <button
            onClick={handleUrl}
            disabled={loading || !url.trim()}
            className="w-full bg-sjsu-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-sjsu-blue-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Ingesting…' : 'Ingest URL'}
          </button>
        </div>
      )}

      {/* Batch URLs tab */}
      {tab === 'batch' && (
        <div className="space-y-3">
          <textarea
            placeholder="One URL per line"
            value={batchUrls}
            onChange={(e) => setBatchUrls(e.target.value)}
            rows={6}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sjsu-blue resize-none"
          />
          <button
            onClick={handleBatch}
            disabled={loading || batchCount === 0}
            className="w-full bg-sjsu-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-sjsu-blue-dark disabled:opacity-50 transition-colors"
          >
            {loading
              ? 'Ingesting…'
              : `Ingest ${batchCount} URL${batchCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* File upload tab */}
      {tab === 'file' && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-sjsu-blue bg-sjsu-blue-muted'
                : 'border-gray-300 hover:border-sjsu-blue hover:bg-sjsu-blue-muted/40'
            }`}
          >
            <p className="text-sm text-sjsu-gray">
              {loading
                ? 'Uploading…'
                : 'Drop a PDF or .txt file here, or click to browse'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF and plain text only</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {/* Status message */}
      {status && (
        <div
          className={`mt-3 text-xs rounded-lg px-3 py-2 ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {status.text}
        </div>
      )}
    </div>
  );
}
