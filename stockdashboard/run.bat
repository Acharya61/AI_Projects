@echo off
cd /d "%~dp0"
set PATH=C:\nodejs\node-v22.14.0-win-x64;%PATH%
echo Starting StockDash...
npm run dev
pause
