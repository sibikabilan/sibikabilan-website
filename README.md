# sibikabilan.com

Personal site of Sibi Kabilan: entrepreneur, engineer, writer. Next.js 16, React 19, Tailwind 4, three.js (react-three-fiber), Motion and Lenis. Deployed on Vercel from `main`.

## Editing content

Everything editable lives behind **/admin** (sign in with `ADMIN_PASSWORD`).

- **Writing** – essays in Markdown with live preview, cover images, tags, drafts.
- **Fiction** – stories with chapters. Reorder, draft and publish chapters one at a time. Readers get a reading view with page themes, type size, width and leading.
- **Site settings** – hero copy, bio, the "Right now" list, links, which sections show, and the default lighting.

Images dropped into the editor are compressed in the browser and uploaded to Vercel Blob.

## How content is stored

`src/lib/cms` keeps a single JSON index plus one document per post or chapter in **Vercel Blob**. Every write creates a new immutable blob (random suffix), so CDN caching can never serve stale content and drafts sit at unguessable URLs. The newest index is found with `list()`; old versions are pruned. Public pages are static and revalidated on every save.

Without `BLOB_READ_WRITE_TOKEN` (local development), the same code writes to a gitignored `.data/` folder instead.

The three starter essays in `src/content/starter-posts.ts` appear on a fresh site and become normal editable posts the first time they're saved.

## Environment

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Password for /admin. Changing it signs everyone out. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store for content and uploads. |
| `SESSION_SECRET` | Optional extra entropy for signing admin sessions. |

## Local development

```bash
npm install
npm run dev
```

## Media

Scene stills and loops were generated with Higgsfield; every image of Sibi is his real photograph (cut out, and lightly animated as a transparent video: `public/media/sibi-live.webm` for Chromium/Firefox and `.mov` HEVC with alpha for Safari).
