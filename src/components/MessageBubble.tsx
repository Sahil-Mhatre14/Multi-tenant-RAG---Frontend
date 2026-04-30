'use client';

import type { Message } from '@/types';

function renderText(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <br key={i} />;

    // Inline **bold**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const rendered = parts.map((part, j) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={j}>{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    );

    // Headings
    if (line.startsWith('### '))
      return (
        <h3 key={i} className="font-semibold mt-2">
          {line.slice(4)}
        </h3>
      );
    if (line.startsWith('## ') || line.startsWith('# '))
      return (
        <h2 key={i} className="font-bold mt-3 text-base">
          {line.replace(/^#+\s/, '')}
        </h2>
      );

    // Bullet points
    if (/^[-*•]\s/.test(line)) {
      return (
        <div key={i} className="flex gap-2">
          <span className="mt-0.5 text-sjsu-gold font-bold">•</span>
          <span>{rendered}</span>
        </div>
      );
    }

    return <p key={i}>{rendered}</p>;
  });
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isUser
            ? 'bg-sjsu-blue text-white'
            : 'bg-sjsu-blue-muted text-sjsu-blue'
        }`}
      >
        {isUser ? 'You' : 'AI'}
      </div>

      <div
        className={`flex flex-col gap-1 max-w-2xl ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {message.rewritten_query && (
          <p className="text-xs text-gray-400 italic px-1">
            Interpreted as: &ldquo;{message.rewritten_query}&rdquo;
          </p>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-1 ${
            isUser
              ? 'bg-sjsu-blue text-white'
              : 'bg-white border text-gray-800'
          }`}
        >
          {renderText(message.content)}
        </div>
      </div>
    </div>
  );
}
