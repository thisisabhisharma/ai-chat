import React from "react";

export type ChatSession = {
  id: string;
  title: string;
  messages: { role: string; content: string; timestamp: number }[];
};

const SESSIONS_KEY = "chat_sessions";

function getSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SESSIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export default function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  visible = true,
  onClose,
}: {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  visible?: boolean;
  onClose?: () => void;
}) {
  // Responsive: hide on mobile/tablet if not visible
  const sidebarClass = `w-64 bg-[#181818] text-white h-screen p-4 flex flex-col z-40
    fixed top-0 left-0 transition-transform duration-200
    md:static md:translate-x-0
    ${visible ? 'translate-x-0' : '-translate-x-full'}
    md:block`;

  return (
    <aside className={sidebarClass} style={{ minWidth: 256 }}>
      {/* Close button for mobile/tablet */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Sessions</h2>
        <button
          className="bg-white text-black px-2 py-1 rounded text-sm md:hidden"
          onClick={onCreateSession}
        >
          + New
        </button>
        {onClose && (
          <button
            className="ml-2 text-white bg-transparent text-2xl leading-none md:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        )}
      </div>
      <ul className="flex-1 overflow-y-auto space-y-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
              session.id === currentSessionId ? "bg-[#333]" : "hover:bg-[#222]"
            }`}
            onClick={() => onSelectSession(session.id)}
          >
            <span className="truncate max-w-[120px]">{session.title}</span>
            <button
              className="ml-2 text-red-500 hover:text-white text-base font-bold px-3 py-2 rounded transition-colors duration-150 bg-red-100 hover:bg-red-600 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              title="Delete session"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      {/* New session button for desktop */}
      <button
        className="bg-white text-black px-2 py-1 rounded text-sm mt-4 hidden md:block"
        onClick={onCreateSession}
      >
        + New
      </button>
    </aside>
  );
}

export { getSessions, saveSessions, SESSIONS_KEY }; 