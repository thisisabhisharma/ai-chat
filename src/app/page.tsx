"use client"

import { useState } from "react"

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [count, setCount] = useState(0)
  const MAX = 10

  const sendMessage = async () => {
    if (!input.trim() || count >= MAX) return

    setMessages([...messages, { role: "user", content: input }])
    setInput("")
    setCount(prev => prev + 1)

    const res = await fetch("/api/openrouter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    })
    if (!res.ok) {
      const errorText = await res.text()
      setMessages(prev => [...prev, { role: "assistant", content: `❌ Error: ${errorText}` }])
      return
    }

    const data = await res.json()
    setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chat bot</h1>

      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded ${msg.role === "user" ? "bg-white text-right text-black" : "bg-purple-500"}`}>
            {msg.content}
          </div>
        ))}
      </div>

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
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-2">Messages left: {MAX - count}</p>
    </main>
  )
}
