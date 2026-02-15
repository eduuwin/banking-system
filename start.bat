@echo off
REM Script de inicializacao do Nibanky para Windows
REM Este script facilita o inicio do projeto

echo.
echo ========================================
echo   Bem-vindo ao Nibanky - Banco Digital
echo ========================================
echo.

REM Verifica se Docker esta instalado
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Docker nao encontrado!
    echo Por favor, instale o Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo OK Docker encontrado!
echo.

REM Verifica se .env existe
if not exist .env (
    echo Criando arquivo .env...
    copy .env.example .env
    echo OK Arquivo .env criado!
    echo.
)

echo Iniciando o Nibanky...
echo.
echo Isso pode levar alguns minutos na primeira vez...
echo Por favor, aguarde...
echo.

docker-compose up --build
