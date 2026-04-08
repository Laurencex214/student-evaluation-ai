@echo off
:: ============================================================
:: run_setup.bat — CNHS AI Student System — One-click Setup
:: Double-click this file to create the DB and run migrations.
:: Supports XAMPP on C:\ or D:\
:: ============================================================

:: ---- Auto-detect PHP & MySQL ----
set PHP=
set MYSQL=

if exist "C:\xampp\php\php.exe" (
    set PHP=C:\xampp\php\php.exe
    set MYSQL=C:\xampp\mysql\bin\mysql.exe
) else if exist "D:\xampp\php\php.exe" (
    set PHP=D:\xampp\php\php.exe
    set MYSQL=D:\xampp\mysql\bin\mysql.exe
) else if exist "C:\laragon\bin\php\php.exe" (
    for /d %%i in (C:\laragon\bin\php\php*) do set PHP=%%i\php.exe
    set MYSQL=C:\laragon\bin\mysql\mysql.exe
) else (
    echo [ERROR] Could not find PHP or XAMPP installation.
    echo Please edit this file and set the PHP and MYSQL paths manually.
    pause
    exit /B 1
)

set PROJECT_DIR=%~dp0

echo.
echo ============================================================
echo  CNHS AI Student System — Setup Script                    
echo ============================================================
echo.
echo Using PHP: %PHP%
echo Using MySQL: %MYSQL%
echo.

:: Check if MySQL binary exists
if not exist "%MYSQL%" (
    echo [ERROR] MySQL not found at %MYSQL%
    echo Please make sure XAMPP/Laragon is installed and MySQL is started.
    pause
    exit /B 1
)

echo [1/5] Creating database 'ai_student_system'...
"%MYSQL%" -u root --password= -e "CREATE DATABASE IF NOT EXISTS ai_student_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Could not create database. Is MySQL running in XAMPP?
    echo Make sure MySQL is started in XAMPP Control Panel.
    pause
    exit /B 1
)
echo       Database created successfully!
echo.

echo [2/5] Clearing Laravel config cache...
"%PHP%" "%PROJECT_DIR%artisan" config:clear
echo.

echo [3/5] Clearing application cache...
"%PHP%" "%PROJECT_DIR%artisan" cache:clear
echo.

echo [4/5] Running database migrations...
"%PHP%" "%PROJECT_DIR%artisan" migrate --force
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Migration failed. Check the error above.
    pause
    exit /B 1
)
echo       Tables created successfully!
echo.

echo ============================================================
echo  Setup Complete!
echo ============================================================
echo.
echo [5/5] Starting development server...
echo       App available at: http://localhost:8000
echo       Press Ctrl+C to stop the server.
echo.
"%PHP%" "%PROJECT_DIR%artisan" serve

pause
