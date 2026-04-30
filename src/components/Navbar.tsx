import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-sjsu-blue text-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight flex items-center gap-2">
          <span className="text-sjsu-gold font-bold">SJSU</span>
          <span>RAG Engine</span>
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link
            href="/chat"
            className="hover:text-sjsu-gold transition-colors"
          >
            Chat
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-sjsu-gold transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
