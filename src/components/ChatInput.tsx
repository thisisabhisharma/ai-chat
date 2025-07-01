"use client"
import { useState } from "react"

type ChatInputProps = {
  onSend: (message: string) => void
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onSend(input)
    setInput("")
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex gap-2 p-4 bg-white shadow-md">
      <input
        type="text"
        className="flex-1 border rounded px-4 py-2 text-gray-800"
        placeholder="Ask something..."
        aria-label="Chat input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </form>
  )
}
