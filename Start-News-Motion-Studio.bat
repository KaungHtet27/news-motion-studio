@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js 20+ is required. Install from https://nodejs.org/ & pause & exit /b 1)
if not exist node_modules (echo Installing web dependencies... & npm install) 
if errorlevel 1 (echo Dependency installation failed. & pause & exit /b 1)
echo Starting News Motion Studio web editor...
npm run dev
pause
