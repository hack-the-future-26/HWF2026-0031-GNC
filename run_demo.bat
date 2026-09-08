@echo off
title HAT-Light Satellite Super-Resolution Studio Launcher
echo ======================================================================
echo Launching HAT-Light Satellite Super-Resolution Studio (Zero-GPU Ready)
echo ======================================================================
IF EXIST ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe run_demo.py
) ELSE IF EXIST "..\.venv\Scripts\python.exe" (
    ..\.venv\Scripts\python.exe run_demo.py
) ELSE IF EXIST "..\SIH_SatSuperResoulution\.venv\Scripts\python.exe" (
    ..\SIH_SatSuperResoulution\.venv\Scripts\python.exe run_demo.py
) ELSE (
    python run_demo.py
)
pause
