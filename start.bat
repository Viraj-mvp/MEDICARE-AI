@echo off
setlocal enabledelayedexpansion
title MEDICARE-AI - Management Console

:: Configuration
set "LOG_DIR=logs"
set "PORT=3000"

:menu
cls
echo ===================================================
echo      MEDICARE AI - HEALTHCARE PLATFORM MANAGER
echo ===================================================
echo.
echo  [1] First Time Setup (Dependencies + Environment)
echo  [2] Start Application (Dev Mode)
echo  [3] Start MongoDB Service
echo  [4] Run Production Build
echo  [5] Clean Project (Clear .next + node_modules)
echo  [6] Exit
echo.
echo ===================================================
set /p choice="Select an option (1-6): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto start_app
if "%choice%"=="3" goto start_mongo
if "%choice%"=="4" goto build_app
if "%choice%"=="5" goto clean_project
if "%choice%"=="6" goto exit

goto menu

:setup
cls
echo ===================================================
echo          INITIAL PROJECT SETUP
echo ===================================================
echo.

:: Create log directory
if not exist "%LOG_DIR%" (
    echo Creating logs directory...
    mkdir "%LOG_DIR%"
)

:: Validate Node.js
echo Checking Node.js version...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+.
    pause
    goto menu
)

:: Environment Setup
if not exist ".env.local" (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local >nul
    
    :: Generate a secure 64-character JWT_SECRET automatically
    echo Generating secure JWT_SECRET...
    for /f "tokens=*" %%a in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set "NEW_SECRET=%%a"
    
    :: Use powershell to replace the placeholder with the new secret in .env.local
    powershell -Command "(gc .env.local) -replace 'your_secure_jwt_secret_must_be_64_chars_long_generate_one_now', '!NEW_SECRET!' | Out-File -encoding ASCII .env.local"
    
    echo [OK] .env.local created with a secure JWT_SECRET.
    echo [NOTICE] Please update .env.local with your other API keys (Groq, Gemini, etc.) if needed.
)

:: Install Dependencies
echo.
echo Step 1: Installing Dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [WARNING] npm install failed with legacy-peer-deps. Trying with --force...
    call npm install --force
)

echo.
echo Setup Complete!
pause
goto menu

:start_app
cls
echo ===================================================
echo          STARTING APPLICATION
echo ===================================================
echo.

:: Validate dependencies
if not exist "node_modules" (
    echo [ERROR] node_modules not found. Please run Setup [1] first.
    pause
    goto menu
)

:: Check MongoDB
echo Verifying MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MongoDB service is running.
) else (
    if %errorlevel% equ 2 (
        echo [OK] MongoDB is already running.
    ) else (
        echo [WARNING] MongoDB service failed to start. Ensure it is installed and check logs.
    )
)

echo.
echo Starting Next.js Server on port %PORT%...
echo Open http://localhost:%PORT% in your browser.
echo Press Ctrl+C to stop.
echo.
npm run dev -- -p %PORT%
if %errorlevel% neq 0 (
    echo [ERROR] Application failed to start. Check logs/next-development.log
)
pause
goto menu

:start_mongo
cls
echo Starting MongoDB Service...
net start MongoDB
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start MongoDB. Ensure you have administrator privileges.
)
pause
goto menu

:build_app
cls
echo ===================================================
echo          PRODUCTION BUILD
echo ===================================================
echo.
echo Running production build...
call npm run build
if %errorlevel% equ 0 (
    echo [SUCCESS] Build completed successfully.
) else (
    echo [ERROR] Build failed.
)
pause
goto menu

:clean_project
cls
echo ===================================================
echo          CLEAN PROJECT
echo ===================================================
echo.
echo This will delete .next and node_modules.
set /p confirm="Are you sure? (y/n): "
if /i "%confirm%" neq "y" goto menu

echo Cleaning .next...
if exist ".next" rd /s /q ".next"
echo Cleaning node_modules...
if exist "node_modules" rd /s /q "node_modules"
echo.
echo [OK] Project cleaned.
pause
goto menu

:exit
endlocal
exit
