@echo off
title ConsentLog Enterprise Platform v2.0 - Launcher
color 0B
echo ============================================================================
echo   CONSENTLOG ENTERPRISE EDITION v2.0
echo   Intelligent Consent ^& Preference Management Platform
echo ============================================================================
echo.
echo   [1] Starting Backend API Server (Port 5000) + MongoDB Replica Set...
echo   [2] Starting React Frontend Dashboard (Port 5173)...
echo   [3] Opening Browser automatically in 5 seconds...
echo.
echo   Keep this window open while using the application.
echo   Press Ctrl+C to stop the servers.
echo ============================================================================
echo.

cd /d "%~dp0"
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:5173"
call npm run dev
pause

