"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  verifyPassword,
} from "@/lib/auth";
import { assertAdmin } from "@/lib/session";
import { CMS_TAG } from "@/lib/cms/queries";
import {
  CmsError,
  deleteChapter,
  deletePost,
  deleteWork,
  moveChapter,
  saveChapter,
  savePost,
  saveSettings,
  saveWork,
  type ChapterInput,
  type PostInput,
  type WorkInput,
} from "@/lib/cms/repo";
import type { Settings } from "@/lib/cms/types";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

function refreshSite() {
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
}

async function guarded<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Your session expired. Sign in again to save." };
  }
  try {
    const data = await fn();
    refreshSite();
    return { ok: true, data };
  } catch (err) {
    if (err instanceof CmsError) return { ok: false, error: err.message };
    console.error("[admin] action failed", err);
    return { ok: false, error: "Saving failed. Check the storage connection and try again." };
  }
}

/* ───────── auth ───────── */

const attempts = new Map<string, { count: number; reset: number }>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.reset < now) {
    attempts.set(ip, { count: 1, reset: now + 10 * 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 8;
}

export async function login(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD is not set for this deployment." };
  }
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (throttled(ip)) return { error: "Too many attempts. Wait a few minutes and try again." };

  const password = String(formData.get("password") ?? "");
  if (!(await verifyPassword(password))) return { error: "That password is not right." };

  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  attempts.delete(ip);
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ───────── posts ───────── */

export async function savePostAction(input: PostInput) {
  return guarded(async () => {
    const post = await savePost(input);
    return { id: post.id, slug: post.slug, status: post.status };
  });
}

export async function deletePostAction(id: string) {
  return guarded(async () => {
    await deletePost(id);
    return null;
  });
}

/* ───────── fiction ───────── */

export async function saveWorkAction(input: WorkInput) {
  return guarded(async () => {
    const work = await saveWork(input);
    return { id: work.id, slug: work.slug, status: work.status };
  });
}

export async function deleteWorkAction(id: string) {
  return guarded(async () => {
    await deleteWork(id);
    return null;
  });
}

export async function saveChapterAction(workId: string, input: ChapterInput) {
  return guarded(async () => {
    const chapter = await saveChapter(workId, input);
    return { id: chapter.id, slug: chapter.slug, status: chapter.status };
  });
}

export async function deleteChapterAction(workId: string, chapterId: string) {
  return guarded(async () => {
    await deleteChapter(workId, chapterId);
    return null;
  });
}

export async function moveChapterAction(workId: string, chapterId: string, delta: -1 | 1) {
  return guarded(async () => {
    await moveChapter(workId, chapterId, delta);
    return null;
  });
}

/* ───────── settings ───────── */

export async function saveSettingsAction(input: Partial<Settings>) {
  return guarded(async () => saveSettings(input));
}
