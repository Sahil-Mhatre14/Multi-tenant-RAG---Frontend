'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { CreateDepartmentResponse } from '@/types';

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isValidSlug(value: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(value);
}

export default function AddDepartmentPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [deptId, setDeptId] = useState('');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<CreateDepartmentResponse | null>(null);

  // Auto-generate slug from display name unless user has manually edited it
  useEffect(() => {
    if (!slugEdited) {
      setDeptId(toSlug(displayName));
    }
  }, [displayName, slugEdited]);

  const slugValid = isValidSlug(deptId);
  const canSubmit = displayName.trim().length > 0 && slugValid && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.createDepartment({
        dept_id: deptId,
        display_name: displayName.trim(),
        fallback_message: fallbackMessage.trim() || undefined,
      });
      setCreated(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl font-bold">✓</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Department Created</h1>
        <p className="text-sm text-sjsu-gray mb-6">
          <strong>{created.display_name}</strong> is ready. Its RAG corpus has been provisioned
          and the knowledge base is live.
        </p>

        <div className="bg-gray-50 rounded-xl border p-4 text-left text-xs space-y-2 mb-8">
          <div>
            <span className="text-sjsu-gray">Department ID</span>
            <p className="font-mono font-medium text-gray-800 mt-0.5">{created.dept_id}</p>
          </div>
          <div>
            <span className="text-sjsu-gray">Display Name</span>
            <p className="font-medium text-gray-800 mt-0.5">{created.display_name}</p>
          </div>
          <div>
            <span className="text-sjsu-gray">Corpus Resource Name</span>
            <p className="font-mono text-gray-800 mt-0.5 break-all">{created.corpus_name}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href={`/dashboard/${created.dept_id}`}
            className="bg-sjsu-blue text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-sjsu-blue-dark transition-colors"
          >
            Go to {created.display_name} Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="border text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link
        href="/dashboard"
        className="text-sm text-sjsu-blue hover:underline mb-6 inline-block"
      >
        ← Back to Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <div className="w-1 h-8 bg-sjsu-gold rounded-full" />
        <h1 className="text-2xl font-bold text-gray-900">Add Department</h1>
      </div>
      <p className="text-sjsu-gray text-sm mb-8 ml-4">
        A new Vertex AI RAG corpus will be provisioned automatically.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-6">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department Name
          </label>
          <input
            type="text"
            placeholder="e.g. Student Housing"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sjsu-blue"
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Dept ID / Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department ID
            <span className="ml-2 text-xs font-normal text-sjsu-gray">
              used in API paths and URLs
            </span>
          </label>
          <input
            type="text"
            placeholder="e.g. student-housing"
            value={deptId}
            onChange={(e) => {
              setSlugEdited(true);
              setDeptId(e.target.value);
            }}
            className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 transition-colors ${
              deptId && !slugValid
                ? 'border-red-400 focus:ring-red-400'
                : 'focus:ring-sjsu-blue'
            }`}
            disabled={loading}
          />

          {/* Inline validation feedback */}
          {deptId && !slugValid && (
            <p className="mt-1.5 text-xs text-red-500">
              Must start with a letter and contain only lowercase letters, digits, and hyphens.
            </p>
          )}
          {deptId && slugValid && (
            <p className="mt-1.5 text-xs text-sjsu-gray">
              Chat API path:{' '}
              <span className="font-mono text-gray-700">
                POST /api/v1/chat — dept_id: &quot;{deptId}&quot;
              </span>
            </p>
          )}
        </div>

        {/* Fallback message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fallback Contact Message
            <span className="ml-2 text-xs font-normal text-sjsu-gray">
              shown when the AI has no answer
            </span>
          </label>
          <textarea
            rows={2}
            placeholder={`e.g. Please contact the ${displayName || 'department'} office at (408) 924-XXXX or visit sjsu.edu/... for help.`}
            value={fallbackMessage}
            onChange={(e) => setFallbackMessage(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sjsu-blue resize-none"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-sjsu-gray">
            Leave blank to use a generic default.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-sjsu-blue text-white text-sm font-medium py-2.5 rounded-lg hover:bg-sjsu-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating corpus…' : 'Create Department'}
        </button>
      </form>
    </div>
  );
}
