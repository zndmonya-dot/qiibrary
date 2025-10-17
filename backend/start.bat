@echo off
cd /d %~dp0
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booktuber?client_encoding=utf8
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

