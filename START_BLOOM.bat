@echo off
title BLOOM Web App
echo ====================================================
echo   Starting BLOOM Web App with Gemini AI & Voice Support
echo ====================================================
cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js detected.
    echo [OK] Launching BLOOM server on http://localhost:8080...
    echo.
    echo Opening in Google Chrome / Default Browser...
    start "" http://localhost:8080/preview.html
    node server.js
    pause
    exit /b
)

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [NOTICE] Node.js not found in PATH, but Python is available.
    echo [OK] Starting local server via Python on http://localhost:8080...
    start "" http://localhost:8080/preview.html
    python -m http.server 8080 --directory "%~dp0"
    exit /b
)

echo [WARNING] Neither Node.js nor Python was found in your PATH.
echo For full microphone access and Gemini AI, please install Node.js from https://nodejs.org/
echo Opening standalone preview.html in default browser...
start "" "%~dp0preview.html"
pause
