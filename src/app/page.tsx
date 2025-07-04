"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import ChatSidebar, { ChatSession, getSessions, saveSessions } from "../components/ChatSidebar"

function createNewSession(): ChatSession {
  return {
    id: Date.now().toString(),
    title: 'New Session',
    messages: [],
  }
}

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const MAX = 10

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loaded = getSessions()
    setSessions(loaded)
    if (loaded.length > 0) {
      setCurrentSessionId(loaded[0].id)
    } else {
      const newSession = createNewSession()
      setSessions([newSession])
      setCurrentSessionId(newSession.id)
      saveSessions([newSession])
    }
  }, [])

  // Get current session
  const currentSession = sessions.find(s => s.id === currentSessionId) || null
  const count = currentSession ? currentSession.messages.filter(m => m.role === "user").length : 0

  // Update session in state and localStorage
  function updateSessionMessages(messages: ChatSession["messages"]) {
    if (!currentSession) return
    const updated = sessions.map(s =>
      s.id === currentSession.id ? { ...s, messages } : s
    )
    setSessions(updated)
    saveSessions(updated)
  }

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || count >= MAX || loading || !currentSession) return
    let newTitle = currentSession.title;
    if (
      currentSession.messages.length === 0 &&
      currentSession.title === 'New Session'
    ) {
      // Use first two words of input as session title
      newTitle = input.trim().split(/\s+/).slice(0, 2).join(' ');
    }
    const newMessages = [
      ...currentSession.messages,
      { role: "user", content: input, timestamp: Date.now() },
    ];
    // If title changed, update session title as well
    if (newTitle !== currentSession.title) {
      const updated = sessions.map(s =>
        s.id === currentSession.id ? { ...s, messages: newMessages, title: newTitle } : s
      );
      setSessions(updated);
      saveSessions(updated);
    } else {
      updateSessionMessages(newMessages);
    }
    setInput("")
    setLoading(true)
    try {
      const res = await fetch("/api/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })
      if (!res.ok) {
        const errorText = await res.text()
        updateSessionMessages([
          ...newMessages,
          { role: "assistant", content: `❌ Error: ${errorText}`, timestamp: Date.now() },
        ])
      } else {
        const data = await res.json()
        updateSessionMessages([
          ...newMessages,
          { role: "assistant", content: data.reply, timestamp: Date.now() },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  // Create new session
  function handleCreateSession() {
    const newSession = createNewSession()
    const updated = [newSession, ...sessions]
    setSessions(updated)
    setCurrentSessionId(newSession.id)
    saveSessions(updated)
  }

  // Select session
  function handleSelectSession(id: string) {
    setCurrentSessionId(id)
    setSidebarOpen(false) // close sidebar on mobile after selecting
  }

  // Delete session
  function handleDeleteSession(id: string) {
    const filtered = sessions.filter((s) => s.id !== id);
    saveSessions(filtered);
    setSessions(filtered);
    if (currentSessionId === id && filtered.length > 0) {
      setCurrentSessionId(filtered[0].id);
    } else if (filtered.length === 0) {
      handleCreateSession();
    }
  }

  // Sidebar overlay for mobile/tablet
  const sidebarOverlay = sidebarOpen ? (
    <div className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
  ) : null

  return (
    <div className="flex h-screen relative">
      {/* Sidebar and overlay */}
      {/* Hamburger button for mobile/tablet */}
      <button
        className="absolute top-4 left-4 z-50 md:hidden bg-[#181818] text-white p-2 rounded focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        style={{ display: sidebarOpen ? 'none' : undefined }}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>
      {sidebarOverlay}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        visible={sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 768}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 max-w-2xl mx-auto p-4">
        <div>
          <h1 className="text-2xl font-bold mb-4 flex justify-center items-center text-center">AI Chat bot</h1>
          <div id="msgDiv" className="space-y-2 pb-32">
            {currentSession?.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded w-full max-w-[80%] break-all whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#747474] text-white"
                      : "bg-[#202020] text-white"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 rounded bg-gray-200 text-gray-500 italic w-fit">
                  AI is typing...⏳⏳⏳
                </div>
              </div>
            )}
          </div>
        </div>
        <div id="bottomDiv" style={{ width: '90%' }} className="fixed bg-[#252525] bottom-0 max-w-2xl mx-auto p-4">
          <div className="flex mt-4 gap-2">
            <input
              className="flex-1 border rounded px-4 py-2"
              value={input}
              placeholder="Ask something..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              disabled={loading}
            />
            <button
              className={`${input === "" ? 'bg-gray-400 text-white px-4 py-2 rounded disabled:opacity-50' : 'bg-white text-black px-4 py-2 rounded disabled:opacity-50'}`}
              onClick={sendMessage}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Messages left: {MAX - count}</p>
        </div>
      </main>
    </div>
  )
}
