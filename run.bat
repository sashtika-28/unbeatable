@echo off
title Placement Preparation and Tracking System
echo ==============================================================
echo  Starting Placement Preparation and Tracking System Server...
echo ==============================================================
cd /d "%~dp0backend"
node server.js
pause
