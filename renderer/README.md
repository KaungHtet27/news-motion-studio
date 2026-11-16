# Local Renderer (Windows)

1. Install Node.js 20+ and FFmpeg. Confirm `ffmpeg -version` works in PowerShell.
2. Open PowerShell in this folder:
   ```powershell
   npm install
   npm start
   ```
3. Keep the terminal open. The service binds only to `127.0.0.1:47831`.
4. In the web editor, the status should change to LOCAL RENDERER CONNECTED.

Output MP4 files are saved under `renderer/output/`. The service accepts images and video clips assigned to scenes, plus optional audio and SRT files. Current renderer produces sequential scene clips; crossfade transitions, true layered parallax, map generation, narration-to-SRT timing validation and robust project persistence are planned follow-up work.

Security: this is a local development companion, not an internet-facing server. Do not change its bind address to 0.0.0.0 or expose the port publicly.
