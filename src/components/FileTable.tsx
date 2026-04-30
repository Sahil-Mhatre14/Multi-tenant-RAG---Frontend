'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { CorpusFile } from '@/types';

const STATE_BADGE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
  UNKNOWN: 'bg-gray-100 text-gray-500',
};

interface Props {
  files: CorpusFile[];
  loading: boolean;
  error: string;
  deptId: string;
  onDeleted: () => void;
}

export default function FileTable({
  files,
  loading,
  error,
  deptId,
  onDeleted,
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (file: CorpusFile) => {
    const fileId = file.name.split('/').pop()!;
    const label = file.display_name || fileId;
    if (!confirm(`Delete "${label}" from the corpus?`)) return;

    setDeletingId(fileId);
    try {
      await api.deleteFile(deptId, fileId);
      onDeleted();
    } catch (e) {
      alert(`Delete failed: ${(e as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return <p className="text-sm text-sjsu-gray py-4">Loading files…</p>;
  if (error)
    return <p className="text-sm text-red-500 py-4">{error}</p>;
  if (files.length === 0)
    return (
      <p className="text-sm text-sjsu-gray py-4">
        No files indexed yet. Upload content using the panel on the right.
      </p>
    );

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-sjsu-blue-muted border-b">
          <tr>
            <th className="text-left px-4 py-3 text-sjsu-blue font-semibold text-xs uppercase tracking-wide">
              File
            </th>
            <th className="text-left px-4 py-3 text-sjsu-blue font-semibold text-xs uppercase tracking-wide">
              Status
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {files.map((f) => {
            const fileId = f.name.split('/').pop()!;
            const badgeClass = STATE_BADGE[f.state] ?? STATE_BADGE.UNKNOWN;

            return (
              <tr key={f.name} className="hover:bg-sjsu-blue-muted/40 transition-colors">
                <td
                  className="px-4 py-3 text-gray-800 max-w-[220px] truncate"
                  title={f.display_name || fileId}
                >
                  {f.display_name || fileId}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}
                  >
                    {f.state}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(f)}
                    disabled={deletingId === fileId}
                    className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40 transition-colors"
                  >
                    {deletingId === fileId ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
