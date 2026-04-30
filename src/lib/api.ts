import type {
  DepartmentsResponse,
  ChatRequest,
  ChatResponse,
  HistoryResponse,
  ListFilesResponse,
  DeleteFileResponse,
  IngestURLRequest,
  IngestURLResponse,
  BatchIngestRequest,
  BatchIngestResponse,
} from '@/types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // ─── Departments ─────────────────────────────────────────────────
  listDepartments: () =>
    request<DepartmentsResponse>('/api/v1/departments'),

  // ─── Chat ────────────────────────────────────────────────────────
  sendMessage: (body: ChatRequest) =>
    request<ChatResponse>('/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  getHistory: (sessionId: string) =>
    request<HistoryResponse>(`/api/v1/chat/${sessionId}/history`),

  clearSession: (sessionId: string) =>
    request<{ message: string }>(`/api/v1/chat/${sessionId}`, {
      method: 'DELETE',
    }),

  // ─── Corpus ──────────────────────────────────────────────────────
  listFiles: (deptId: string) =>
    request<ListFilesResponse>(`/api/v1/corpus/${deptId}/files`),

  deleteFile: (deptId: string, fileId: string) =>
    request<DeleteFileResponse>(
      `/api/v1/corpus/${deptId}/files/${fileId}`,
      { method: 'DELETE' }
    ),

  // ─── Ingest ──────────────────────────────────────────────────────
  ingestUrl: (body: IngestURLRequest) =>
    request<IngestURLResponse>('/api/v1/ingest/url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  ingestUrls: (body: BatchIngestRequest) =>
    request<BatchIngestResponse>('/api/v1/ingest/urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  ingestFile: (file: File, deptId: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('dept_id', deptId);
    return request<IngestURLResponse>('/api/v1/ingest/file', {
      method: 'POST',
      body: form,
    });
  },
};
