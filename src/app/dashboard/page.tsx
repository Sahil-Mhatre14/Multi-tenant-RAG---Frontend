'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { DepartmentInfo } from '@/types';

export default function DashboardPage() {
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listDepartments()
      .then((data) => setDepartments(data.departments))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-sjsu-gray text-sm">
        Loading departments…
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-500 text-sm">{error}</div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Page header with SJSU gold accent bar */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-8 bg-sjsu-gold rounded-full" />
        <h1 className="text-2xl font-bold text-gray-900">
          Knowledge Base Dashboard
        </h1>
      </div>
      <p className="text-sjsu-gray text-sm mb-8 ml-4">
        Manage documents for each department&apos;s RAG corpus.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <Link
            key={dept.dept_id}
            href={`/dashboard/${dept.dept_id}`}
            className="bg-white rounded-xl border hover:border-sjsu-blue hover:shadow-md transition-all p-6 group"
          >
            <div className="w-10 h-10 rounded-lg bg-sjsu-blue-muted flex items-center justify-center mb-4">
              <span className="text-sjsu-blue font-bold text-sm uppercase">
                {dept.dept_id.slice(0, 2)}
              </span>
            </div>
            <h2 className="font-semibold text-gray-900 group-hover:text-sjsu-blue transition-colors">
              {dept.display_name}
            </h2>
            <p className="text-xs text-sjsu-gray mt-1">Manage files →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
