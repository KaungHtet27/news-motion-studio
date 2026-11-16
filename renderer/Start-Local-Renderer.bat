@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js 20+ is required. Install from https://nodejs.org/ & pause & exit /b 1)
where ffmpeg >nul 2>nul || (echo FFmpeg is not in PATH. Install FFmpeg and add its bin folder to PATH. & pause & exit /b 1)
if not exist node_modules (echo Installing renderer dependencies... & npm install)
if errorlevel 1 (echo Dependency installation failed. & pause & exit /b 1)
echo Starting local renderer at http://127.0.0.1:47831
npm start
pause
