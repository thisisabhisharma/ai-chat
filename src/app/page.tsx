"use client"

import { useState } from "react"

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const MAX = 10

  const sendMessage = async () => {
    if (!input.trim() || count >= MAX || loading) return

    setMessages([...messages, { role: "user", content: input }])
    setInput("")
    setCount(prev => prev + 1)
    setLoading(true)

    try {
      const res = await fetch("/api/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })
      if (!res.ok) {
        const errorText = await res.text()
        setMessages(prev => [...prev, { role: "assistant", content: `❌ Error: ${errorText}` }])
      } else {
        const data = await res.json()
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold mb-4">AI Chat bot</h1>

        <div className="space-y-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded w-fit ${msg.role === "user"
                  ? "bg-[#747474] text-white"
                  : "bg-[#202020] text-white"
                  }`}
              >
                {msg.content}
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

      <div className="fixed bottom-0 w-full max-w-2xl mx-auto p-4 shadow-md">
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
  )
}
