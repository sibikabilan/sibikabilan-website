"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function FictionContent() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    console.log("Fiction newsletter signup:", email);
    setSubscribed(true);
    setEmail("");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="mb-4 flex items-center gap-4">
            <span className="text-label">Stories & Worlds</span>
            <hr className="editorial-rule-gold" />
          </div>
          <h1 className="text-display font-italic">Fiction</h1>
        </motion.div>

        {/* Artwork */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="my-16"
        >
          <div className="relative overflow-hidden border border-border">
            <Image
              src="/images/fiction-artwork.png"
              alt="Fiction artwork, technology meets humanity"
              width={800}
              height={600}
              className="w-full"
            />
            <div className="absolute bottom-0 left-0 h-1 w-full bg-accent" />
          </div>
        </motion.div>

        {/* Coming soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-xl"
        >
          <span className="text-label">Coming Soon</span>
          <p className="mt-4 text-editorial-body">
            I&apos;m working on a collection of stories that explore the boundaries
            between technology and humanity. Sign up below to be the first to
            read them.
          </p>
        </motion.div>

        {/* Email signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-8 max-w-md"
        >
          {subscribed ? (
            <div className="border border-accent/30 bg-accent-light/30 p-6">
              <p className="text-sm text-accent">
                Thanks! You&apos;ll be the first to know when stories are published.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                placeholder="Your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover cursor-pointer"
              >
                Notify Me
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
