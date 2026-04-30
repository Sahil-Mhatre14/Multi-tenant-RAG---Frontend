'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import type { DepartmentInfo, Message } from '@/types';
import MessageBubble from './MessageBubble';

export default function ChatInterface() {
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [deptId, setDeptId] = useState('it');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sid = sessionStorage.getItem('rag_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('rag_session_id', sid);
    }
    setSessionId(sid);

    api
      .listDepartments()
      .then((data) => {
        setDepartments(data.departments);
        if (data.departments.length > 0) setDeptId(data.departments[0].dept_id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    api
      .getHistory(sessionId)
      .then((data) => {
        const msgs: Message[] = data.history.flatMap((t) => [
          { role: 'user' as const, content: t.user },
          { role: 'assistant' as const, content: t.assistant },
        ]);
        setMessages(msgs);
      })
      .catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !sessionId) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.sendMessage({
        session_id: sessionId,
        message: userMsg,
        dept_id: deptId,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          rewritten_query: res.rewritten_query,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Error: Could not reach the server. Make sure the backend is running.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    if (!sessionId) return;
    await api.clearSession(sessionId).catch(() => {});
    setMessages([]);
  };

  const handleDeptChange = (newDeptId: string) => {
    setDeptId(newDeptId);
    setMessages([]);
  };

  const activeDept = departments.find((d) => d.dept_id === deptId);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Toolbar */}
      <div className="border-b bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">
            Department:
          </label>
          <select
            value={deptId}
            onChange={(e) => handleDeptChange(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sjsu-blue"
          >
            {departments.map((d) => (
              <option key={d.dept_id} value={d.dept_id}>
                {d.display_name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={clearSession}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear session
        </button>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-24">
            <p className="text-lg font-medium">
              Ask anything about{' '}
              {activeDept?.display_name ?? 'your department'}
            </p>
            <p className="text-sm mt-1">
              Answers are sourced from the indexed knowledge base.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-sjsu-blue-muted flex items-center justify-center text-sjsu-blue font-bold text-xs flex-shrink-0">
              AI
            </div>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t bg-white px-4 py-3 shadow-sm">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sjsu-blue"
            placeholder="Ask a question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && !e.shiftKey && sendMessage()
            }
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-sjsu-blue text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-sjsu-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
