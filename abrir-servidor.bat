@echo off
cd /d "%~dp0"
powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0servidor-local.ps1"
