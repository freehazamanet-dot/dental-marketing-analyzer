# 🦷 DentalMarketing Analyzer

歯科医院向けマーケティング分析・営業支援サービス

## 🚀 クイックスタート

### 起動コマンド

```bash
cd app
pnpm dev
```

ブラウザで http://localhost:3000 を開く

### ログイン情報

| 項目 | 値 |
|------|-----|
| Email | `demo@example.com` |
| Password | `password123` |

---

## 📦 初回セットアップ（まだの場合）

```bash
# 1. 依存関係インストール
pnpm install

# 2. データベースセットアップ
pnpm prisma generate
pnpm db:push

# 3. 初期データ投入
pnpm db:seed

# 4. 開発サーバー起動
pnpm dev
```

または一括で:

```bash
pnpm setup
```

---

## 🔧 利用可能なコマンド

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm local` | ローカル起動（DB確認付き） |
| `pnpm setup` | 初回セットアップ |
| `pnpm db:seed` | シードデータ投入 |
| `pnpm db:push` | スキーマをDBに反映 |
| `pnpm db:studio` | Prisma Studio起動 |
| `pnpm db:reset` | DBリセット＆再シード |

---

## 🔑 環境変数

`.env` ファイルに以下を設定:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dental_marketing"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google Places API（口コミ取得用）
GOOGLE_PLACES_API_KEY="your-api-key"

# Google Analytics & Search Console API（サービスアカウント認証）
# GCPコンソールでサービスアカウントを作成し、以下のAPIを有効化:
# - Google Analytics Data API
# - Google Search Console API
GOOGLE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# OpenRouter API（AI分析用）
OPENROUTER_API_KEY="your-api-key"
```

### Google Analytics & Search Console のセットアップ

1. **GCPでサービスアカウントを作成**
   - GCPコンソール → IAMと管理 → サービスアカウント → 作成
   - JSONキーをダウンロード

2. **必要なAPIを有効化**
   ```bash
   gcloud services enable analyticsdata.googleapis.com
   gcloud services enable searchconsole.googleapis.com
   ```

3. **GA4にサービスアカウントを追加**
   - GA4管理画面 → プロパティ → アクセス管理
   - サービスアカウントのメールアドレスを「閲覧者」として追加

4. **Search Consoleにサービスアカウントを追加**
   - Search Console → 設定 → ユーザーと権限
   - サービスアカウントのメールアドレスを追加

---

## 📱 主な機能

### 1. 歯科医院管理
- 複数の歯科医院を登録・管理
- 基本情報（住所、診療科目、連絡先）

### 2. AI分析
- OpenRouter/Gemini による総合分析
- 課題の自動検出
- 改善提案の生成

### 3. 競合比較
- Google Places APIで周辺医院を検索
- 口コミ数・評価の比較
- エリア内ランキング

### 4. 患者データ管理
- 月別・主訴別の新規患者数入力
- トレンド分析

### 5. 施策管理
- マーケティング施策の登録
- 効果測定・ROI分析

---

## 🛠 技術スタック

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js
- **AI**: OpenRouter (Gemini)
- **External API**: Google Places API

---

## 📁 ディレクトリ構成

```
app/
├── prisma/           # Prismaスキーマ・シード
├── scripts/          # 起動・セットアップスクリプト
├── src/
│   ├── app/          # Next.js App Router
│   │   ├── (auth)/   # 認証ページ
│   │   ├── (dashboard)/ # ダッシュボード
│   │   └── api/      # APIエンドポイント
│   ├── components/   # UIコンポーネント
│   └── lib/          # ユーティリティ・API連携
└── .env              # 環境変数
```
