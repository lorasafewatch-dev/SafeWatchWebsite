@echo off
setlocal
cd /d "%~dp0"
echo SafeWatch Family website
echo.
echo When the server is ready, open http://127.0.0.1:5185/
echo Keep this window open while viewing the website. Press Ctrl+C to stop.
echo.
node server.mjs
if errorlevel 1 pause
endlocal
