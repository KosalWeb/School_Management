@echo off
echo === School Management - Create Desktop Setup ===
echo.

if not exist "..\release\School Management-win32-x64" (
    echo Packaged app not found. Run "npm run electron:build:win" first.
    exit /b 1
)

echo Creating desktop shortcut...
set SCRIPT="%TEMP%\create_shortcut.vbs"
(
    echo Set WshShell = WScript.CreateObject^("WScript.Shell"^)
    echo Set Shortcut = WshShell.CreateShortcut^("%USERPROFILE%\Desktop\School Management.lnk"^)
    echo Shortcut.TargetPath = "%~dp0..\release\School Management-win32-x64\School Management.exe"
    echo Shortcut.WorkingDirectory = "%~dp0..\release\School Management-win32-x64"
    echo Shortcut.Description = "School Management System"
    echo Shortcut.Save
) > %SCRIPT%
cscript //nologo %SCRIPT%
del %SCRIPT%

echo.
echo Done! You can now run the app from:
echo   Desktop shortcut: School Management
echo   Or directly:      release\School Management-win32-x64\School Management.exe
echo.
pause
