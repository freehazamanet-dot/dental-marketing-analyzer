#!/bin/bash

# DentalMarketing Analyzer - 初回セットアップスクリプト

echo "🦷 DentalMarketing Analyzer セットアップ"
echo "========================================"

cd "$(dirname "$0")/.."

# 依存関係インストール
echo ""
echo "📦 依存関係をインストール中..."
pnpm install

# データベースセットアップ
echo ""
echo "🗄️  データベースをセットアップ中..."
pnpm prisma generate
pnpm prisma db push

# シードデータ投入
echo ""
echo "🌱 初期データを投入中..."
pnpm db:seed

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "起動コマンド: ./scripts/start.sh"
echo "または: pnpm dev"

