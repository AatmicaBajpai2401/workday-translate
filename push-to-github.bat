@echo off
echo ========================================
echo Workday Translation Integration
echo Push to GitHub Script
echo ========================================
echo.

REM Check if repository name is provided
set REPO_NAME=workday-translation-integration

echo Creating Git repository...
git init

echo.
echo Adding all files...
git add README.md
git add *.md
git add *.json
git add *.js
git add *.sh

echo.
echo Committing files...
git commit -m "Initial commit: Workday Translation Integration (AWS & Google Cloud)"

echo.
echo Setting up main branch...
git branch -M main

echo.
echo ========================================
echo IMPORTANT: Next Steps
echo ========================================
echo.
echo 1. Go to: https://github.com/AatmicaBajpai2401
echo 2. Click "New repository"
echo 3. Repository name: %REPO_NAME%
echo 4. Make it Public or Private
echo 5. DO NOT initialize with README
echo 6. Click "Create repository"
echo.
echo 7. Then run these commands:
echo.
echo    git remote add origin https://github.com/AatmicaBajpai2401/%REPO_NAME%.git
echo    git push -u origin main
echo.
echo ========================================
echo.

pause

@REM Made with Bob
