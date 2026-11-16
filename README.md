# News Motion Studio

Free-first international news TikTok video workspace. Burmese-first UI, online editor + local Windows renderer architecture.

## Current status

**Web editor MVP scaffold** — story/script entry, local media selection, editable scene list, motion/transition presets, duration calculation, and local renderer connection check. The actual renderer companion and export pipeline are not yet implemented. The UI intentionally does not pretend that rendering has succeeded.

## Requirements

- Node.js 20+
- FFmpeg installed on the Windows PC (the companion will call the local FFmpeg executable)
- npm

## Run the web editor

```bash
npm install
npm run dev
```

Open the local Vite URL printed in the terminal.

## Architecture

- Web UI: React + TypeScript + Vite.
- Local media: browser file picker; files are not uploaded to a cloud service by this UI.
- Planned companion: Node.js service bound to `127.0.0.1:47831`, exposing `GET /health` and a validated local render endpoint.
- Planned render: FFmpeg still-image motion (zoom/pan), transitions, Burmese subtitles, narration mix, 1080x1920 / 30fps / H.264 MP4.
- Planned project persistence: local project JSON and media references.

## Editorial safety

- Keep original source URLs, publication dates, rights notes and fact-check caveats with every story.
- Do not present AI-generated illustrations as authentic event footage.
- Check licensing before using Reuters/AP or other agency footage.
- Human review is required before publishing.

## Free-use note

The app source is free/open source. This does not grant rights to third-party news photos/videos. Hosting provider limits and third-party asset licenses still apply.
