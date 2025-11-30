#!/bin/bash

# DentalMarketing Analyzer - ローカル起動スクリプト

echo "🦷 DentalMarketing Analyzer を起動します..."

# プロジェクトディレクトリに移動
cd "$(dirname "$0")/.."

# PostgreSQLが起動しているか確認
if ! pg_isready -q 2>/dev/null; then
    echo "⚠️  PostgreSQLが起動していません。起動を試みます..."
    brew services start postgresql@15 2>/dev/null || brew services start postgresql 2>/dev/null
    sleep 2
fi

# 環境変数の確認
if [ ! -f .env ]; then
    echo "❌ .envファイルが見つかりません"
    exit 1
fi

# データベース接続確認
echo "📦 データベース接続を確認中..."
pnpm prisma db push --skip-generate 2>/dev/null

# 開発サーバー起動
echo "🚀 開発サーバーを起動します..."
echo ""
echo "=================================="
echo "  http://localhost:3000"
echo "=================================="
echo ""
echo "ログイン情報:"
echo "  Email: demo@example.com"
echo "  Password: password123"
echo ""

pnpm dev

