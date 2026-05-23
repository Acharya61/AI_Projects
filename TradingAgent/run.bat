@echo off
cd /d "%~dp0"
set PATH=C:\Users\DELL\AppData\Local\Programs\Python\Python313;%PATH%
echo Starting AI Trading Agent Server...
python server.py
pause
