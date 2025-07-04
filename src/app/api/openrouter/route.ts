import { NextRequest, NextResponse } from "next/server"
import { translate } from "@vitalets/google-translate-api"

export async function POST(req: NextRequest) {
    const { message } = await req.json()
    const payload = {
        model: "mistralai/mistral-small-3.2-24b-instruct:free",
        messages: [
            {
                role: "user",
                content: message,
            }
        ]
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.OPENROUTER_SITE || "",
            "X-Title": process.env.OPENROUTER_TITLE || "",
        },
        body: JSON.stringify(payload)
    })

    if (!res.ok) {
        console.error("OpenRouter error:", await res.text())
        return NextResponse.json({ reply: "❌ Error from OpenRouter." }, { status: 500 })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || "🤖 No response."

    // Translate reply to English
    let translatedReply = reply
    try {
        const translation = await translate(reply, { to: "en" })
        translatedReply = translation.text
    } catch (e) {
        console.error("Translation error:", e)
        // fallback to original reply
    }

    return NextResponse.json({ reply: translatedReply })
}
