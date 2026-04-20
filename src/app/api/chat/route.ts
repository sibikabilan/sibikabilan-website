import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { PERSONA_PROMPT } from "@/lib/persona";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

// Simple LRU cache for common questions
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 3600_000; // 1 hour

function getCacheKey(message: string): string {
  return message.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").slice(0, 100);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: "Rate limit exceeded. Please wait a moment before trying again." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  const body = await request.json();
  const userMessage = body.message?.trim();

  if (!userMessage || userMessage.length > 500) {
    return Response.json({ error: "Invalid message" }, { status: 400 });
  }

  // Check cache
  const cacheKey = getCacheKey(userMessage);
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Response.json({
      response: cached.response,
      remaining,
      cached: true,
    });
  }

  if (!GEMINI_API_KEY) {
    return Response.json({ error: "Chat service not configured" }, { status: 503 });
  }

  const geminiResponse = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: PERSONA_PROMPT }] },
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    }),
  });

  if (!geminiResponse.ok) {
    return Response.json({ error: "Failed to get response" }, { status: 502 });
  }

  const data = await geminiResponse.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't process that. Try again?";

  // Cache the response
  responseCache.set(cacheKey, { response: text, timestamp: Date.now() });

  // Clean old cache entries
  if (responseCache.size > 200) {
    const now = Date.now();
    for (const [key, val] of responseCache.entries()) {
      if (now - val.timestamp > CACHE_TTL) responseCache.delete(key);
    }
  }

  return Response.json({ response: text, remaining });
}
