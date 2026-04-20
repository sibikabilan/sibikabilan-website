"use client";

import { useState } from "react";
import Image from "next/image";

export function AvatarChat() {
  const [flipped, setFlipped] = useState(false);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("Tap the portrait to ask me anything.");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);
    setReply("Thinking...");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setReply(data.response || data.error || "Something went wrong.");
    } catch {
      setReply("Could not connect. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="group cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={() => !flipped && setFlipped(true)}
    >
      <div
        className="relative transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front: Portrait */}
        <div
          className="relative overflow-hidden border border-border"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Image
            src="/images/portrait.png"
            alt="Sibi Kabilan"
            width={400}
            height={533}
            className="w-full"
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="text-sm font-medium text-white">
              Tap to ask my AI anything
            </span>
          </div>
        </div>

        {/* Back: Chat */}
        <div
          className="absolute inset-0 flex flex-col border border-border bg-surface"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center bg-accent text-xs font-bold text-white">
                SK
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Ask Sibi&apos;s AI</p>
                <p className="text-[10px] text-muted">Powered by Gemini</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              className="text-xs text-muted transition-colors hover:text-foreground cursor-pointer"
            >
              Back
            </button>
          </div>

          {/* Reply bubble */}
          <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-6">
            <p className="text-center text-sm leading-relaxed text-foreground-secondary">
              {reply}
            </p>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            onClick={(e) => e.stopPropagation()}
            className="border-t border-border p-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                maxLength={300}
                className="flex-1 border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-foreground px-4 py-2.5 text-xs font-semibold text-background transition-colors hover:bg-accent disabled:opacity-40 cursor-pointer"
              >
                Ask
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
