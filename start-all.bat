@echo off
start "Backend" cmd /c "cd /d "%~dp0backend" && npm start"
start "Frontend" cmd /c "cd /d "%~dp0frontend" && npm start"
