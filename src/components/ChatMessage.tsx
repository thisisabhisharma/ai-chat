export default function ChatMessage({ role, message }: { role: string, message: string }) {
    const isUser = role === "user"
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
            <div
                style={{ color: "black" }}
                className={`max-w-[70%] p-4 rounded-lg shadow
          ${isUser
                        ? "bg-cadetblue-300 text-gray-900 text-right"
                        : "bg-purple-400 text-gray-900"
                    }`}
            >
                <p style={{ color: "black" }} className="whitespace-pre-line text-black">{message}</p>
                <span className={`block text-xs mt-2 ${isUser ? "text-blue-200 text-right" : "text-gray-400 text-left"}`}>
                    {isUser ? "You" : "AI"}
                </span>
            </div>
        </div>
    )
}
