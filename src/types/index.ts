export interface DepartmentInfo {
  dept_id: string;
  display_name: string;
}

export interface DepartmentsResponse {
  departments: DepartmentInfo[];
}

export interface ChatRequest {
  session_id: string;
  message: string;
  dept_id: string;
}

export interface ChatResponse {
  session_id: string;
  answer: string;
  rewritten_query?: string;
}

export interface HistoryTurn {
  user: string;
  assistant: string;
}

export interface HistoryResponse {
  session_id: string;
  history: HistoryTurn[];
}

export interface CorpusFile {
  name: string;
  display_name: string;
  state: string;
}

export interface ListFilesResponse {
  corpus: string;
  files: CorpusFile[];
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
}

export interface IngestURLRequest {
  url: string;
  dept_id: string;
}

export interface IngestURLResponse {
  success: boolean;
  message: string;
  gcs_uri?: string;
  title?: string;
  word_count?: number;
}

export interface BatchIngestRequest {
  urls: string[];
  dept_id: string;
}

export interface FailedURL {
  url: string;
  error: string;
}

export interface BatchIngestResponse {
  total: number;
  successful: string[];
  failed: FailedURL[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  rewritten_query?: string;
}
