@echo off
title Placement System - Java Backend Server
cd /d "%~dp0"

echo ==============================================================
echo [PTS] Compiling Java Backend Server...
echo ==============================================================

if not exist bin mkdir bin

javac -d bin src/com/pts/backend/*.java
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java compilation failed. Please ensure JDK 17+ or JDK 24 is installed.
    pause
    exit /b %ERRORLEVEL%
)

echo [PTS] Compilation successful!
echo [PTS] Launching Java Backend Server...
echo ==============================================================

java -cp bin com.pts.backend.BackendServer
pause
