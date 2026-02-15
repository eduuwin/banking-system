#!/bin/bash

# Script de inicialização do Nibanky
# Este script facilita o início do projeto

echo "🏦 Bem-vindo ao Nibanky - Banco Digital"
echo "======================================"
echo ""

# Verifica se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado!"
    echo "📥 Por favor, instale o Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verifica se Docker Compose está disponível
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não encontrado!"
    echo "📥 Por favor, instale o Docker Compose"
    exit 1
fi

echo "✅ Docker encontrado!"
echo ""

# Verifica se .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado!"
    echo ""
fi

echo "🚀 Iniciando o Nibanky..."
echo ""
echo "Isso pode levar alguns minutos na primeira vez..."
echo "Por favor, aguarde..."
echo ""

# Usa docker compose (novo) ou docker-compose (antigo)
if docker compose version &> /dev/null; then
    docker compose up --build
else
    docker-compose up --build
fi
