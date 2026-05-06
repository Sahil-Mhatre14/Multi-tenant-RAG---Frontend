'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function EditDepartmentPage({
  params,
}: {
  params: Promise<{ deptId: string }>;
}) {
  const { deptId } = use(params);
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [loadError, setLoadError] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    api
      .listDepartments()
      .then((data) => {
        const dept = data.departments.find((d) => d.dept_id === deptId);
        if (!dept) {
          setLoadError(`Department "${deptId}" not found.`);
          return;
        }
        setDisplayName(dept.display_name);
        setFallbackMessage(dept.fallback_message);
      })
      .catch((e: Error) => setLoadError(e.message));
  }, [deptId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      await api.updateDepartment(deptId, {
        display_name: displayName.trim(),
        fallback_message: fallbackMessage.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await api.deleteDepartment(deptId);
      router.push('/dashboard');
    } catch (err) {
      setDeleteError((err as Error).message);
      setDeleting(false);
    }
  };

  const deleteReady = deleteConfirm === deptId;

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 text-sm">{loadError}</p>
        <Link href="/dashboard" className="text-sjsu-blue text-sm hover:underline mt-4 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!displayName) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-sjsu-gray text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link
        href={`/dashboard/${deptId}`}
        className="text-sm text-sjsu-blue hover:underline mb-6 inline-block"
      >
        ← Back to {displayName}
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <div className="w-1 h-8 bg-sjsu-gold rounded-full" />
        <h1 className="text-2xl font-bold text-gray-900">Edit Department</h1>
      </div>
      <p className="text-sjsu-gray text-sm mb-8 ml-4">
        Changes take effect immediately — no server restart needed.
      </p>

      {/* Edit form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border p-6 space-y-5 mb-8">

        {/* Dept ID — read only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department ID
            <span className="ml-2 text-xs font-normal text-sjsu-gray">read-only</span>
          </label>
          <div className="w-full border rounded-lg px-3 py-2 text-sm font-mono bg-gray-50 text-gray-400">
            {deptId}
          </div>
        </div>

        {/* Display name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sjsu-blue"
            disabled={saving}
            required
          />
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
            rows={3}
            value={fallbackMessage}
            onChange={(e) => setFallbackMessage(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sjsu-blue resize-none"
            disabled={saving}
          />
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
            Changes saved and applied.
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !displayName.trim()}
          className="w-full bg-sjsu-blue text-white text-sm font-medium py-2.5 rounded-lg hover:bg-sjsu-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Delete zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-red-600">Delete Department</h2>
          <p className="text-xs text-sjsu-gray mt-1">
            Removes this department from the registry and unloads its RAG model.
            The Vertex AI corpus is <strong>not</strong> deleted — remove it from
            the GCP console separately if needed.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Type <span className="font-mono font-semibold text-gray-800">{deptId}</span> to confirm
          </label>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={deptId}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={deleting}
          />
        </div>

        {deleteError && (
          <p className="text-xs text-red-500">{deleteError}</p>
        )}

        <button
          onClick={handleDelete}
          disabled={!deleteReady || deleting}
          className="w-full bg-red-500 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {deleting ? 'Deleting…' : `Delete ${deptId}`}
        </button>
      </div>
    </div>
  );
}
