# 歯科医院向けマーケティング分析サービス - 要件定義書

## 実装進捗

### Phase 1: 基盤構築 ✅ 完了
- [x] Prismaセットアップ・スキーマ定義
- [x] データベース作成・マイグレーション
- [x] 認証機能（NextAuth.js）
- [x] 基本レイアウト・UI
- [x] 組織管理機能
- [x] 歯科医院CRUD

### Phase 2: Google API連携 ✅ 完了
- [ ] Google Analytics API連携（要APIキー設定）
- [ ] Search Console API連携（要APIキー設定）
- [x] Google Places API連携（口コミ取得）

### Phase 3: 分析機能 ✅ 完了
- [x] 分析ロジック実装
- [x] 分析ダッシュボード

### Phase 4: 競合比較 ✅ 完了
- [x] 競合医院管理
- [x] 競合比較分析機能

### Phase 5: 患者データ ✅ 完了
- [x] 新規患者データ入力
- [x] 主訴別分析機能

### Phase 6: 施策管理 ✅ 完了
- [x] 施策管理機能
- [x] 施策効果分析機能

### Phase 7: AI分析 ✅ 完了
- [x] OpenRouter/Gemini連携
- [x] AI総合分析・提案機能

### Phase 8: レポート ⏳ 未着手
- [ ] PDF出力
- [ ] 履歴・比較機能

---

## 1. サービス概要

### 1.1 サービス名（仮）
**DentalMarketing Analyzer** - 歯科医院特化型マーケティング分析・営業支援サービス

### 1.2 サービス目的
Googleアナリティクス、Googleサーチコンソール、Google口コミなどのデータを統合分析し、歯科医院の現状課題を可視化。AIによる総合分析を通じて、自社サービス（広告・ポスティング・SEO対策等）を効果的に提案できる営業支援ツール。

### 1.3 技術スタック
| 項目 | 技術 |
|------|------|
| フロントエンド | Next.js (App Router) |
| スタイリング | Tailwind CSS |
| ORM | Prisma |
| データベース | PostgreSQL |
| 本番環境 | Google Cloud |
| AI分析 | OpenRouter API 経由で Gemini 3 を使用 |
| 外部API | Google Analytics API, Search Console API, Google Places API |

### 1.4 OpenRouter連携
```typescript
// OpenRouter経由でGemini 3を呼び出す
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callGeminiViaOpenRouter(prompt: string): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL,
      'X-Title': 'DentalMarketing Analyzer'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001', // または適切なGeminiモデル
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

---

## 2. ユースケース一覧

### 2.1 アクター
| アクター | 説明 |
|----------|------|
| システム管理者 | システム全体の管理、組織・マスタ管理 |
| 組織管理者 | 自組織のメンバー管理、設定管理 |
| 営業担当者 | 歯科医院の登録・分析実行・レポート出力 |

### 2.2 ユースケース図

```
┌─────────────────────────────────────────────────────────────────┐
│                      DentalMarketing Analyzer                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  【認証・ユーザー管理】                                           │
│  ├─ UC-001: ログイン/ログアウト                                   │
│  ├─ UC-002: パスワードリセット                                    │
│  └─ UC-003: プロフィール編集                                      │
│                                                                  │
│  【組織管理】※組織管理者以上                                      │
│  ├─ UC-010: 組織情報管理                                         │
│  ├─ UC-011: メンバー招待・管理                                    │
│  └─ UC-012: 権限設定                                             │
│                                                                  │
│  【マスタ管理】※システム管理者                                    │
│  ├─ UC-020: 提案サービスマスタ管理                                │
│  ├─ UC-021: 分析ルールマスタ管理                                  │
│  └─ UC-022: 診療科目マスタ管理                                    │
│                                                                  │
│  【歯科医院管理】                                                 │
│  ├─ UC-030: 歯科医院登録                                         │
│  ├─ UC-031: 歯科医院情報編集                                      │
│  ├─ UC-032: 歯科医院一覧・検索                                    │
│  ├─ UC-033: Google連携設定（GA/GSC）                             │
│  └─ UC-034: 歯科医院削除（論理削除）                              │
│                                                                  │
│  【データ分析】                                                   │
│  ├─ UC-040: データ取得実行（GA/GSC/口コミ）                       │
│  ├─ UC-041: 分析ダッシュボード表示                                │
│  ├─ UC-042: 流入分析（全体・地域別）                              │
│  ├─ UC-043: 口コミ分析                                           │
│  ├─ UC-044: HP滞在時間分析                                       │
│  ├─ UC-045: 広告効果分析                                         │
│  └─ UC-046: AI総合分析実行                                       │
│                                                                  │
│  【競合比較】                                                     │
│  ├─ UC-060: 競合医院検索・登録                                    │
│  ├─ UC-061: 競合医院口コミ取得                                    │
│  ├─ UC-062: 競合比較ダッシュボード表示                            │
│  └─ UC-063: エリア内ランキング表示                                │
│                                                                  │
│  【新規患者データ管理】                                           │
│  ├─ UC-070: 月別新規患者データ入力                                │
│  ├─ UC-071: 主訴別患者数入力                                      │
│  ├─ UC-072: 患者データ一覧・編集                                  │
│  └─ UC-073: 主訴別トレンド分析                                    │
│                                                                  │
│  【施策管理・効果測定】                                           │
│  ├─ UC-080: 施策登録・編集                                        │
│  ├─ UC-081: 施策一覧表示                                          │
│  ├─ UC-082: 施策効果分析                                          │
│  └─ UC-083: 施策前後比較分析                                      │
│                                                                  │
│  【提案・レポート】                                               │
│  ├─ UC-050: 課題・提案一覧表示                                    │
│  ├─ UC-051: レポート生成（PDF）                                   │
│  ├─ UC-052: 分析履歴表示                                         │
│  └─ UC-053: 履歴比較                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 ユースケース詳細

#### UC-030: 歯科医院登録
| 項目 | 内容 |
|------|------|
| アクター | 営業担当者 |
| 事前条件 | ログイン済み |
| 基本フロー | 1. 新規登録ボタンをクリック<br>2. 基本情報を入力（医院名、住所、URL等）<br>3. Google Places APIで口コミ情報を自動取得<br>4. 登録完了 |
| 代替フロー | Places APIで医院が見つからない場合、手動でPlace IDを入力 |
| 事後条件 | 歯科医院データが登録される |

#### UC-033: Google連携設定
| 項目 | 内容 |
|------|------|
| アクター | 営業担当者 |
| 事前条件 | 歯科医院が登録済み |
| 基本フロー | 1. 対象医院の設定画面を開く<br>2. GA/GSCのプロパティIDを設定<br>3. OAuth認証でアクセス許可を取得<br>4. 連携テスト実行<br>5. 設定完了 |
| 代替フロー | 認証失敗時はエラー表示、再試行を促す |
| 事後条件 | API連携が有効化される |

#### UC-046: AI総合分析実行
| 項目 | 内容 |
|------|------|
| アクター | 営業担当者 |
| 事前条件 | 分析対象データが取得済み |
| 基本フロー | 1. 分析実行ボタンをクリック<br>2. 各指標データをGemini APIに送信<br>3. AIが課題を特定し、提案を生成<br>4. 結果を画面に表示<br>5. 分析結果を履歴として保存 |
| 代替フロー | API エラー時はリトライ、それでも失敗時はエラー表示 |
| 事後条件 | 分析結果が保存され、提案サービスが紐付けられる |

#### UC-060: 競合医院検索・登録
| 項目 | 内容 |
|------|------|
| アクター | 営業担当者 |
| 事前条件 | 対象歯科医院が登録済み |
| 基本フロー | 1. 競合設定画面を開く<br>2. 検索条件を入力（エリア、診療科目等）<br>3. Google Places APIで周辺の歯科医院を検索<br>4. 検索結果から競合として登録する医院を選択<br>5. 競合医院として登録 |
| 代替フロー | 手動でPlace IDを入力して登録 |
| 事後条件 | 競合医院データが登録される |

#### UC-062: 競合比較ダッシュボード表示
| 項目 | 内容 |
|------|------|
| アクター | 営業担当者 |
| 事前条件 | 競合医院が1件以上登録済み |
| 基本フロー | 1. 競合比較タブを開く<br>2. 自院と競合医院の口コミ数・評価を比較表示<br>3. エリア内でのランキングを表示<br>4. 競合との差分から課題を自動検出 |
| 代替フロー | - |
| 事後条件 | - |

#### UC-070: 月別新規患者データ入力
| 項目 | 内容 |
|------|------|
| アクター | 営業担当者 |
| 事前条件 | 歯科医院が登録済み |
| 基本フロー | 1. 患者データ入力画面を開く<br>2. 対象年月を選択<br>3. 主訴別の新規患者数を入力（虫歯、矯正、インプラント、ホワイトニング等）<br>4. 保存ボタンをクリック<br>5. データが保存される |
| 代替フロー | 既存データがある場合は上書き確認ダイアログを表示 |
| 事後条件 | 月別患者データが登録される |

#### UC-073: 主訴別トレンド分析
| 項目 | 内容 |
|------|------|
| アクター | 営業担当者 |
| 事前条件 | 2ヶ月以上の患者データが登録済み |
| 基本フロー | 1. 患者分析タブを開く<br>2. 期間を選択<br>3. 主訴別のトレンドグラフを表示<br>4. 増減の大きい主訴をハイライト表示<br>5. AI分析と連携して傾向を解説 |
| 代替フロー | - |
| 事後条件 | - |

#### UC-080: 施策登録・編集
| 項目 | 内容 |
|------|------|
| アクター | 営業担当者 |
| 事前条件 | 歯科医院が登録済み |
| 基本フロー | 1. 施策管理画面を開く<br>2. 新規施策登録ボタンをクリック<br>3. 施策情報を入力（名称、種別、開始日、終了日、費用等）<br>4. 保存ボタンをクリック |
| 代替フロー | 既存施策の編集・終了処理 |
| 事後条件 | 施策データが登録される |

#### UC-082: 施策効果分析
| 項目 | 内容 |
|------|------|
| アクター | 営業担当者 |
| 事前条件 | 施策が登録済み、施策前後の各種データが存在 |
| 基本フロー | 1. 施策効果分析画面を開く<br>2. 分析対象の施策を選択<br>3. 施策実施前後の各指標を比較表示（流入数、患者数、口コミ等）<br>4. AIが効果を総合評価<br>5. ROI（投資対効果）を算出 |
| 代替フロー | データ不足の場合はその旨を表示 |
| 事後条件 | 効果分析結果が保存される |

---

## 3. 画面一覧・設計

### 3.1 画面一覧

| No | 画面ID | 画面名 | 概要 | アクセス権限 |
|----|--------|--------|------|--------------|
| 1 | SCR-001 | ログイン | 認証画面 | 全員 |
| 2 | SCR-002 | パスワードリセット | パスワード再設定 | 全員 |
| 3 | SCR-010 | ダッシュボード | ホーム画面、サマリー表示 | 営業担当者以上 |
| 4 | SCR-020 | 歯科医院一覧 | 登録医院の一覧・検索 | 営業担当者以上 |
| 5 | SCR-021 | 歯科医院登録/編集 | 医院情報の登録・編集 | 営業担当者以上 |
| 6 | SCR-022 | Google連携設定 | GA/GSC連携設定 | 営業担当者以上 |
| 7 | SCR-030 | 分析ダッシュボード | 個別医院の分析結果表示 | 営業担当者以上 |
| 8 | SCR-031 | 流入分析詳細 | GA流入データ詳細 | 営業担当者以上 |
| 9 | SCR-032 | 口コミ分析詳細 | 口コミデータ詳細 | 営業担当者以上 |
| 10 | SCR-033 | AI分析結果 | Gemini分析結果表示 | 営業担当者以上 |
| 11 | SCR-034 | 競合比較ダッシュボード | 競合医院との比較表示 | 営業担当者以上 |
| 12 | SCR-035 | 競合医院設定 | 競合医院の検索・登録 | 営業担当者以上 |
| 13 | SCR-036 | エリア内ランキング | 地域内での順位表示 | 営業担当者以上 |
| 14 | SCR-037 | 新規患者データ入力 | 月別・主訴別患者数入力 | 営業担当者以上 |
| 15 | SCR-038 | 患者データ一覧 | 入力済み患者データ一覧 | 営業担当者以上 |
| 16 | SCR-039 | 主訴別トレンド分析 | 主訴別患者数推移グラフ | 営業担当者以上 |
| 17 | SCR-040 | 分析履歴一覧 | 過去の分析結果一覧 | 営業担当者以上 |
| 18 | SCR-041 | 履歴比較 | 複数履歴の比較表示 | 営業担当者以上 |
| 19 | SCR-042 | 施策一覧 | 登録施策の一覧・管理 | 営業担当者以上 |
| 20 | SCR-043 | 施策登録/編集 | 施策情報の入力・編集 | 営業担当者以上 |
| 21 | SCR-044 | 施策効果分析 | 施策前後の効果比較 | 営業担当者以上 |
| 22 | SCR-050 | レポート出力 | PDFレポート生成・プレビュー | 営業担当者以上 |
| 23 | SCR-060 | メンバー管理 | 組織メンバーの管理 | 組織管理者以上 |
| 24 | SCR-070 | 提案サービスマスタ | サービスマスタ管理 | システム管理者 |
| 25 | SCR-071 | 分析ルールマスタ | 分析ルール管理 | システム管理者 |
| 26 | SCR-072 | 主訴マスタ | 主訴カテゴリ管理 | システム管理者 |
| 27 | SCR-080 | 設定 | ユーザー設定 | 営業担当者以上 |

### 3.2 主要画面ワイヤーフレーム

#### SCR-030: 分析ダッシュボード

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [← 戻る]  ○○歯科クリニック - 分析ダッシュボード      [データ更新] [PDF出力] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📊 サマリー                                    最終更新: 2024/01/15  │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │ 月間流入  │  │ 地域流入率 │  │ 平均滞在  │  │ 口コミ評価 │        │   │
│  │  │  1,234   │  │   45%    │  │  1:23    │  │  ⭐ 4.2  │        │   │
│  │  │  ↑12%   │  │  ↓ 5%   │  │  → 0%   │  │  (87件) │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐   │
│  │ 🚨 検出された課題              │  │ 💡 提案サービス               │   │
│  ├──────────────────────────────┤  ├──────────────────────────────┤   │
│  │ ⚠️ 地域からの流入が少ない     │  │ ☑ MEO対策                    │   │
│  │   → 全国SEO流入の可能性      │  │ ☑ ローカルSEO対策            │   │
│  │                              │  │ ☐ リスティング広告           │   │
│  │ ⚠️ 口コミ数が競合より少ない   │  │ ☑ 口コミ促進サービス          │   │
│  │   → 比較検討で不利           │  │                              │   │
│  └──────────────────────────────┘  └──────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🤖 AI総合分析                                        [再分析]     │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  現状分析：                                                       │   │
│  │  当医院はWebサイトへの流入数は月間1,234件と一定の集客力がありますが、│   │
│  │  地域別分析を見ると、医院所在地である東京都渋谷区からのアクセスは     │   │
│  │  全体の15%にとどまっています。これは全国向けのSEOコンテンツが...    │   │
│  │                                                                  │   │
│  │  推奨アクション：                                                  │   │
│  │  1. ローカルSEO対策の実施（優先度：高）                            │   │
│  │  2. 口コミ促進施策の導入（優先度：高）                             │   │
│  │  3. ...                                                          │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [タブ: 流入分析 | 口コミ分析 | 競合比較 | 滞在時間 | 広告効果 | 履歴]    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  （選択されたタブの詳細コンテンツ）                                 │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### SCR-020: 歯科医院一覧

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 歯科医院一覧                                           [+ 新規登録]      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🔍 検索・フィルター                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [医院名・住所で検索...                    ] [都道府県 ▼] [担当者 ▼] │   │
│  │ ☐ 未分析のみ  ☐ 課題ありのみ  期間: [2024/01 ▼] 〜 [2024/12 ▼]   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 医院名          │ 住所        │ 口コミ │ 最終分析  │ ステータス │ 操作 │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ ○○歯科         │ 東京都渋谷区 │ ⭐4.2 │ 2024/01/15│ 課題あり  │ [...] │
│  │ △△デンタル     │ 大阪府大阪市 │ ⭐3.8 │ 2024/01/10│ 課題あり  │ [...] │
│  │ □□クリニック   │ 福岡県福岡市 │ ⭐4.5 │ -         │ 未分析    │ [...] │
│  │ ...             │ ...        │ ...   │ ...       │ ...      │ [...] │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [< 前へ] ページ 1 / 10 [次へ >]                          表示: [20 ▼] │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### SCR-034: 競合比較ダッシュボード

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [← 戻る]  ○○歯科クリニック - 競合比較              [競合設定] [更新]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📍 エリア内ランキング（渋谷区）                     全12医院中     │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  口コミ数ランキング: 5位 / 12医院  ⚠️ 競合より少ない             │   │
│  │  評価ランキング:     3位 / 12医院  ✅ 上位                       │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🏆 競合医院比較                                                   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  医院名              │ 口コミ数 │ 評価  │ 差分      │ 状態       │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  ○○歯科（自院）     │   87件  │ ⭐4.2 │    -      │    -       │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  △△デンタル         │  156件  │ ⭐4.5 │ +69件    │ 🔴 負け    │   │
│  │  □□クリニック       │  142件  │ ⭐4.3 │ +55件    │ 🔴 負け    │   │
│  │  ◇◇歯科医院         │   95件  │ ⭐4.0 │  +8件    │ 🟡 僅差    │   │
│  │  ☆☆デンタルオフィス │   62件  │ ⭐3.8 │ -25件    │ 🟢 勝ち    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐   │
│  │ 📊 口コミ数推移グラフ         │  │ 📈 評価推移グラフ             │   │
│  ├──────────────────────────────┤  ├──────────────────────────────┤   │
│  │                              │  │                              │   │
│  │   ▲                         │  │  5.0 ─────────────────────   │   │
│  │   │    △△──────△△          │  │      ──────────────────────  │   │
│  │   │  ○○────○○──            │  │  4.0 ────○○────○○────○○──   │   │
│  │   │                         │  │                              │   │
│  │   └─────────────────────▶   │  │  3.0 ─────────────────────   │   │
│  │    1月  2月  3月  4月        │  │      1月  2月  3月  4月      │   │
│  │                              │  │                              │   │
│  └──────────────────────────────┘  └──────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 💡 競合分析からの提案                                            │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  ⚠️ 口コミ数が競合上位医院と比べて少ない状況です。               │   │
│  │     比較検討時に不利になる可能性があります。                      │   │
│  │                                                                  │   │
│  │  推奨: 口コミ促進サービスの導入を検討してください。               │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### SCR-037: 新規患者データ入力

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [← 戻る]  ○○歯科クリニック - 新規患者データ入力                [保存]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📅 対象年月: [2024年 ▼] [1月 ▼]                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 👥 主訴別新規患者数                                              │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  主訴カテゴリ          │ 新規患者数  │ 前月  │ 前年同月 │ 増減   │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  🦷 虫歯治療           │ [  25  ] 人 │  22人 │   20人  │ ↑13%  │   │
│  │  😁 矯正歯科           │ [   8  ] 人 │   5人 │    6人  │ ↑60%  │   │
│  │  🔩 インプラント        │ [   3  ] 人 │   4人 │    2人  │ ↓25%  │   │
│  │  ✨ ホワイトニング      │ [  12  ] 人 │  10人 │    8人  │ ↑20%  │   │
│  │  🧹 クリーニング・予防  │ [  35  ] 人 │  30人 │   28人  │ ↑17%  │   │
│  │  🏥 歯周病治療         │ [  15  ] 人 │  18人 │   12人  │ ↓17%  │   │
│  │  👶 小児歯科           │ [  10  ] 人 │   8人 │    7人  │ ↑25%  │   │
│  │  🆘 緊急・痛み         │ [  18  ] 人 │  15人 │   14人  │ ↑20%  │   │
│  │  📋 その他             │ [   5  ] 人 │   6人 │    5人  │ ↓17%  │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  📊 合計               │    131  人  │ 118人 │  102人  │ ↑11%  │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📝 メモ・特記事項                                                │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ [                                                               ] │   │
│  │ [  矯正相談が増加。SNS広告の効果か？                              ] │   │
│  │ [                                                               ] │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [キャンセル]                                                  [保存]   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### SCR-044: 施策効果分析

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [← 戻る]  ○○歯科クリニック - 施策効果分析              [PDF出力] [更新]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🎯 分析対象施策                                                   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  施策名: Instagram広告キャンペーン                                │   │
│  │  種別: SNS広告  │  期間: 2024/01/15 〜 2024/02/14  │  費用: ¥150,000│   │
│  │  ターゲット: 矯正・ホワイトニング訴求                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📊 施策前後比較                          施策前(1ヶ月) → 施策後(1ヶ月) │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  指標                │ 施策前   │ 施策後   │ 変化     │ 評価    │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  📈 HP流入数（全体）  │   980件  │  1,420件 │ +45%    │ ✅ 効果大│   │
│  │  📱 SNS経由流入      │   120件  │    380件 │ +217%   │ ✅ 効果大│   │
│  │  ⏱️ 平均滞在時間     │  1:15    │   1:45   │ +40%    │ ✅ 改善  │   │
│  │  👥 新規患者数（全体）│   118人  │    142人 │ +20%    │ ✅ 効果有│   │
│  │  😁 矯正 新規患者    │     5人  │     12人 │ +140%   │ ✅ 効果大│   │
│  │  ✨ ホワイトニング   │    10人  │     18人 │ +80%    │ ✅ 効果大│   │
│  │  ⭐ 口コミ数         │    82件  │     89件 │ +9%     │ 🟡 微増  │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐   │
│  │ 📈 主訴別患者数推移           │  │ 💰 ROI分析                    │   │
│  ├──────────────────────────────┤  ├──────────────────────────────┤   │
│  │                              │  │                              │   │
│  │   ▲ 矯正                     │  │  施策費用:      ¥150,000     │   │
│  │   │  ┌───┐                  │  │  ─────────────────────────   │   │
│  │   │  │   │  ← 施策開始       │  │  新規患者増加:    +24人      │   │
│  │   │  │   └───────            │  │  推定売上増:    ¥720,000     │   │
│  │ 12├──┤                       │  │  ─────────────────────────   │   │
│  │   │  │                       │  │  ROI:           480%        │   │
│  │  5├──┘                       │  │  1患者獲得単価:  ¥6,250      │   │
│  │   └─────────────────────▶   │  │                              │   │
│  │    12月  1月  2月  3月       │  │  評価: ✅ 高い投資効果       │   │
│  │                              │  │                              │   │
│  └──────────────────────────────┘  └──────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🤖 AI効果分析                                          [再分析]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  【効果サマリー】                                                 │   │
│  │  Instagram広告キャンペーンは非常に効果的でした。特に矯正と        │   │
│  │  ホワイトニングの新規患者獲得に大きく貢献しています。             │   │
│  │                                                                  │   │
│  │  【成功要因】                                                     │   │
│  │  1. ターゲット設定が適切（20-30代女性への訴求）                   │   │
│  │  2. ビジュアル訴求が効果的だった可能性                            │   │
│  │  3. 時期的要因（新年の美容ニーズ）                                │   │
│  │                                                                  │   │
│  │  【推奨アクション】                                               │   │
│  │  - 継続実施を推奨（ROI 480%は非常に良好）                         │   │
│  │  - 予算増額の検討（現在の2倍程度まで）                            │   │
│  │  - 類似施策の横展開（TikTok広告等）                               │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. データ項目（Prismaスキーマ）

### 4.1 ER図（概要）

```
┌─────────────┐      ┌─────────────┐      ┌─────────────────┐
│Organization │──1:N─│    User     │──1:N─│  DentalClinic   │
└─────────────┘      └─────────────┘      └─────────────────┘
                                                   │
      ┌────────────┬────────────┬─────────────────┼─────────────────┬────────────┬────────────┐
      │            │            │                 │                 │            │            │
      ▼            ▼            ▼                 ▼                 ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐     ┌──────────┐     ┌──────────┐ ┌──────────┐ ┌──────────┐
│Analytics │ │SearchCon │ │ Review   │     │Competitor│     │ Monthly  │ │ Measure  │ │ Analysis │
│  Data    │ │soleData  │ │  Data    │     │          │     │ Patient  │ │(施策)    │ │  Result  │
└──────────┘ └──────────┘ └──────────┘     └────┬─────┘     └────┬─────┘ └────┬─────┘ └──────────┘
                                                │                │            │              │
                                                ▼                ▼            ▼              ▼
                                         ┌──────────┐     ┌──────────┐ ┌──────────┐  ┌──────────┐
                                         │Competitor│     │ Patient  │ │ Measure  │  │ Proposed │
                                         │ReviewData│     │ByComplnt │ │ Effect   │  │ Service  │
                                         └──────────┘     └──────────┘ └──────────┘  └──────────┘
                                                                │                          │
                                                                ▼                          ▼
                                                         ┌──────────┐              ┌──────────┐
                                                         │ChiefComp │              │Service   │
                                                         │laintMstr │              │ Master   │
                                                         └──────────┘              └──────────┘
```

### 4.2 Prismaスキーマ定義

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// 認証・組織関連
// ============================================

/// 組織（会社・チーム）
model Organization {
  id        String   @id @default(cuid())
  name      String   /// 組織名
  plan      String   @default("standard") /// 契約プラン
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? /// 論理削除

  users         User[]
  dentalClinics DentalClinic[]

  @@map("organizations")
}

/// ユーザー（営業担当者）
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  hashedPassword String
  name           String
  role           UserRole @default(SALES)
  organizationId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime? /// 論理削除

  organization    Organization     @relation(fields: [organizationId], references: [id])
  dentalClinics   DentalClinic[]   @relation("AssignedClinics")
  analysisResults AnalysisResult[]

  @@map("users")
}

enum UserRole {
  SYSTEM_ADMIN  /// システム管理者
  ORG_ADMIN     /// 組織管理者
  SALES         /// 営業担当者
}

// ============================================
// 歯科医院関連
// ============================================

/// 歯科医院
model DentalClinic {
  id             String   @id @default(cuid())
  organizationId String
  assignedUserId String?  /// 担当営業
  
  // 基本情報
  name           String   /// 医院名
  postalCode     String?  /// 郵便番号
  prefecture     String   /// 都道府県
  city           String   /// 市区町村
  address        String   /// 住所詳細
  phoneNumber    String?  /// 電話番号
  websiteUrl     String?  /// ホームページURL
  
  // Google連携情報
  googlePlaceId       String?  @unique /// Google Place ID
  gaPropertyId        String?  /// Google Analytics プロパティID
  gscSiteUrl          String?  /// Search Console サイトURL
  googleOAuthToken    Json?    /// OAuth トークン（暗号化保存）
  googleTokenExpiry   DateTime? /// トークン有効期限
  
  // 診療情報
  specialties    String[] /// 診療科目（矯正、インプラント等）
  
  // メタ情報
  status         ClinicStatus @default(ACTIVE)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  deletedAt      DateTime?    /// 論理削除

  organization     Organization       @relation(fields: [organizationId], references: [id])
  assignedUser     User?              @relation("AssignedClinics", fields: [assignedUserId], references: [id])
  analyticsData    AnalyticsData[]
  searchConsoleData SearchConsoleData[]
  reviewData       ReviewData[]
  analysisResults  AnalysisResult[]
  competitors      Competitor[]       /// 競合医院
  monthlyPatientData MonthlyPatientData[] /// 月別患者データ
  measures         Measure[]          /// 施策

  @@map("dental_clinics")
}

enum ClinicStatus {
  ACTIVE    /// アクティブ
  INACTIVE  /// 非アクティブ
  PENDING   /// 連携待ち
}

/// 診療科目マスタ
model SpecialtyMaster {
  id        String   @id @default(cuid())
  name      String   @unique /// 科目名（矯正歯科、インプラント等）
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("specialty_masters")
}

// ============================================
// 分析データ関連
// ============================================

/// Google Analytics データ
model AnalyticsData {
  id             String   @id @default(cuid())
  dentalClinicId String
  
  // 集計期間
  periodStart    DateTime /// 集計開始日
  periodEnd      DateTime /// 集計終了日
  
  // セッション・ユーザー
  totalSessions      Int    /// 総セッション数
  totalUsers         Int    /// 総ユーザー数
  newUsers           Int    /// 新規ユーザー数
  
  // 滞在時間
  avgSessionDuration Float  /// 平均セッション時間（秒）
  bounceRate         Float  /// 直帰率（%）
  
  // 地域別データ
  regionData     Json    /// { "東京都": 45, "神奈川県": 20, ... }
  cityData       Json    /// { "渋谷区": 30, "新宿区": 15, ... }
  
  // 流入元別データ
  channelData    Json    /// { "organic": 500, "paid": 200, "direct": 100, ... }
  
  // 広告データ
  paidSessions       Int?   /// 広告経由セッション
  paidAvgDuration    Float? /// 広告経由 平均滞在時間
  paidBounceRate     Float? /// 広告経由 直帰率
  
  // メタ情報
  fetchedAt      DateTime @default(now()) /// データ取得日時
  rawData        Json?    /// 生データ（デバッグ用）

  dentalClinic   DentalClinic @relation(fields: [dentalClinicId], references: [id])

  @@unique([dentalClinicId, periodStart, periodEnd])
  @@map("analytics_data")
}

/// Search Console データ
model SearchConsoleData {
  id             String   @id @default(cuid())
  dentalClinicId String
  
  // 集計期間
  periodStart    DateTime
  periodEnd      DateTime
  
  // パフォーマンスデータ
  totalClicks       Int    /// 総クリック数
  totalImpressions  Int    /// 総表示回数
  avgCtr            Float  /// 平均CTR（%）
  avgPosition       Float  /// 平均掲載順位
  
  // クエリ別データ
  queryData      Json    /// [{ "query": "渋谷 歯医者", "clicks": 50, ... }, ...]
  
  // ページ別データ
  pageData       Json    /// [{ "page": "/services", "clicks": 30, ... }, ...]
  
  // メタ情報
  fetchedAt      DateTime @default(now())
  rawData        Json?

  dentalClinic   DentalClinic @relation(fields: [dentalClinicId], references: [id])

  @@unique([dentalClinicId, periodStart, periodEnd])
  @@map("search_console_data")
}

/// Google 口コミデータ
model ReviewData {
  id             String   @id @default(cuid())
  dentalClinicId String
  
  // 口コミサマリー
  totalReviews   Int      /// 口コミ総数
  averageRating  Float    /// 平均評価（1.0-5.0）
  
  // 評価分布
  rating5Count   Int      /// ★5の数
  rating4Count   Int      /// ★4の数
  rating3Count   Int      /// ★3の数
  rating2Count   Int      /// ★2の数
  rating1Count   Int      /// ★1の数
  
  // 最新口コミ
  latestReviews  Json?    /// [{ "author": "...", "rating": 5, "text": "...", "time": "..." }, ...]
  
  // メタ情報
  fetchedAt      DateTime @default(now())
  rawData        Json?

  dentalClinic   DentalClinic @relation(fields: [dentalClinicId], references: [id])

  @@map("review_data")
}

// ============================================
// 競合医院関連
// ============================================

/// 競合医院
model Competitor {
  id             String   @id @default(cuid())
  dentalClinicId String   /// 親医院（自院）
  
  // 基本情報
  name           String   /// 競合医院名
  googlePlaceId  String   /// Google Place ID
  prefecture     String   /// 都道府県
  city           String   /// 市区町村
  address        String?  /// 住所詳細
  
  // 距離情報
  distanceMeters Int?     /// 自院からの距離（メートル）
  
  // 診療情報
  specialties    String[] /// 診療科目
  
  // メタ情報
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  dentalClinic   DentalClinic          @relation(fields: [dentalClinicId], references: [id])
  reviewData     CompetitorReviewData[]

  @@unique([dentalClinicId, googlePlaceId])
  @@map("competitors")
}

/// 競合医院口コミデータ
model CompetitorReviewData {
  id            String   @id @default(cuid())
  competitorId  String
  
  // 口コミサマリー
  totalReviews  Int      /// 口コミ総数
  averageRating Float    /// 平均評価（1.0-5.0）
  
  // 評価分布
  rating5Count  Int      /// ★5の数
  rating4Count  Int      /// ★4の数
  rating3Count  Int      /// ★3の数
  rating2Count  Int      /// ★2の数
  rating1Count  Int      /// ★1の数
  
  // メタ情報
  fetchedAt     DateTime @default(now())
  rawData       Json?

  competitor    Competitor @relation(fields: [competitorId], references: [id])

  @@map("competitor_review_data")
}

// ============================================
// 新規患者データ関連
// ============================================

/// 主訴マスタ
model ChiefComplaintMaster {
  id          String   @id @default(cuid())
  name        String   @unique /// 主訴名（虫歯治療、矯正歯科等）
  icon        String?  /// アイコン絵文字
  description String?  /// 説明
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  patientsByComplaint PatientByComplaint[]

  @@map("chief_complaint_masters")
}

/// 月別患者データ
model MonthlyPatientData {
  id             String   @id @default(cuid())
  dentalClinicId String
  
  // 対象年月
  year           Int      /// 年（2024等）
  month          Int      /// 月（1-12）
  
  // 合計
  totalNewPatients Int    /// 新規患者合計
  
  // メモ
  memo           String?  @db.Text /// 特記事項
  
  // メタ情報
  inputById      String?  /// 入力者
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  dentalClinic        DentalClinic          @relation(fields: [dentalClinicId], references: [id])
  patientsByComplaint PatientByComplaint[]

  @@unique([dentalClinicId, year, month])
  @@map("monthly_patient_data")
}

/// 主訴別患者数
model PatientByComplaint {
  id                   String   @id @default(cuid())
  monthlyPatientDataId String
  chiefComplaintId     String
  
  patientCount         Int      /// 患者数
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  monthlyPatientData   MonthlyPatientData   @relation(fields: [monthlyPatientDataId], references: [id])
  chiefComplaint       ChiefComplaintMaster @relation(fields: [chiefComplaintId], references: [id])

  @@unique([monthlyPatientDataId, chiefComplaintId])
  @@map("patients_by_complaint")
}

// ============================================
// 施策管理・効果測定関連
// ============================================

/// 施策
model Measure {
  id             String   @id @default(cuid())
  dentalClinicId String
  
  // 基本情報
  name           String   /// 施策名
  category       MeasureCategory /// 施策カテゴリ
  description    String?  @db.Text /// 施策詳細
  
  // 期間
  startDate      DateTime /// 開始日
  endDate        DateTime? /// 終了日（null=継続中）
  
  // 費用
  cost           Int?     /// 費用（円）
  costType       CostType @default(ONE_TIME) /// 費用タイプ
  
  // ターゲット
  targetComplaint String[] /// 対象主訴（矯正、ホワイトニング等）
  targetArea     String?  /// 対象エリア
  targetAudience String?  /// ターゲット層（20-30代女性等）
  
  // メタ情報
  status         MeasureStatus @default(ACTIVE)
  createdById    String?  /// 登録者
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  dentalClinic   DentalClinic    @relation(fields: [dentalClinicId], references: [id])
  effects        MeasureEffect[]

  @@map("measures")
}

enum MeasureCategory {
  LISTING_AD      /// リスティング広告
  SNS_AD          /// SNS広告
  SEO             /// SEO対策
  MEO             /// MEO対策
  POSTING         /// ポスティング
  REFERRAL        /// 紹介施策
  REVIEW_CAMPAIGN /// 口コミキャンペーン
  HP_RENEWAL      /// HP改善
  OTHER           /// その他
}

enum CostType {
  ONE_TIME  /// 一回払い
  MONTHLY   /// 月額
}

enum MeasureStatus {
  PLANNED   /// 予定
  ACTIVE    /// 実施中
  COMPLETED /// 完了
  CANCELLED /// 中止
}

/// 施策効果測定
model MeasureEffect {
  id          String   @id @default(cuid())
  measureId   String
  
  // 測定期間
  periodType  EffectPeriodType /// 測定期間タイプ
  
  // 施策前データ（1ヶ月分）
  beforePeriodStart DateTime /// 施策前期間（開始）
  beforePeriodEnd   DateTime /// 施策前期間（終了）
  beforeSessions    Int?     /// 施策前 セッション数
  beforeNewPatients Int?     /// 施策前 新規患者数
  beforeReviews     Int?     /// 施策前 口コミ数
  beforeAvgDuration Float?   /// 施策前 平均滞在時間
  
  // 施策後データ（1ヶ月分）
  afterPeriodStart  DateTime /// 施策後期間（開始）
  afterPeriodEnd    DateTime /// 施策後期間（終了）
  afterSessions     Int?     /// 施策後 セッション数
  afterNewPatients  Int?     /// 施策後 新規患者数
  afterReviews      Int?     /// 施策後 口コミ数
  afterAvgDuration  Float?   /// 施策後 平均滞在時間
  
  // 主訴別効果（JSON）
  complaintEffects  Json?    /// [{ "complaint": "矯正", "before": 5, "after": 12 }, ...]
  
  // ROI計算
  estimatedRevenue  Int?     /// 推定売上増加額
  roi               Float?   /// ROI（%）
  costPerAcquisition Float?  /// 1患者獲得単価
  
  // AI分析結果
  aiAnalysis        String?  @db.Text /// AI効果分析テキスト
  aiAnalyzedAt      DateTime? /// AI分析実行日時
  
  // メタ情報
  analyzedAt        DateTime @default(now())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  measure           Measure @relation(fields: [measureId], references: [id])

  @@map("measure_effects")
}

enum EffectPeriodType {
  ONE_MONTH   /// 1ヶ月後
  THREE_MONTH /// 3ヶ月後
  SIX_MONTH   /// 6ヶ月後
}

// ============================================
// 分析結果・提案関連
// ============================================

/// 分析結果
model AnalysisResult {
  id             String   @id @default(cuid())
  dentalClinicId String
  analyzedById   String   /// 分析実行者

  // 分析日時・期間
  analyzedAt     DateTime @default(now())
  periodStart    DateTime /// 分析対象期間（開始）
  periodEnd      DateTime /// 分析対象期間（終了）

  // 各種スコア・指標
  trafficScore       Int?    /// 流入スコア（0-100）
  localTrafficRate   Float?  /// 地域流入率（%）
  engagementScore    Int?    /// エンゲージメントスコア（0-100）
  reviewScore        Int?    /// 口コミスコア（0-100）
  adEfficiencyScore  Int?    /// 広告効率スコア（0-100）
  overallScore       Int?    /// 総合スコア（0-100）

  // 検出された課題
  issues         Json    /// [{ "type": "LOW_TRAFFIC", "severity": "HIGH", "message": "..." }, ...]

  // AI分析結果
  aiAnalysis     String? @db.Text /// Gemini による総合分析テキスト
  aiAnalyzedAt   DateTime? /// AI分析実行日時

  // メタ情報
  status         AnalysisStatus @default(COMPLETED)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  dentalClinic     DentalClinic      @relation(fields: [dentalClinicId], references: [id])
  analyzedBy       User              @relation(fields: [analyzedById], references: [id])
  proposedServices ProposedService[]

  @@map("analysis_results")
}

enum AnalysisStatus {
  PENDING     /// 処理中
  COMPLETED   /// 完了
  FAILED      /// 失敗
}

/// 提案サービス（中間テーブル）
model ProposedService {
  id               String   @id @default(cuid())
  analysisResultId String
  serviceMasterId  String
  
  priority         Int      @default(0) /// 優先度（高いほど優先）
  reason           String?  /// 提案理由
  isAccepted       Boolean? /// 顧客が受諾したか
  
  createdAt        DateTime @default(now())

  analysisResult   AnalysisResult @relation(fields: [analysisResultId], references: [id])
  serviceMaster    ServiceMaster  @relation(fields: [serviceMasterId], references: [id])

  @@unique([analysisResultId, serviceMasterId])
  @@map("proposed_services")
}

// ============================================
// マスタデータ
// ============================================

/// 提案サービスマスタ
model ServiceMaster {
  id          String   @id @default(cuid())
  name        String   /// サービス名
  category    String   /// カテゴリ（広告/SEO/その他）
  description String?  @db.Text /// サービス説明
  price       String?  /// 価格帯
  
  // 提案条件
  triggerConditions Json? /// 自動提案の条件 [{ "type": "LOW_TRAFFIC", "threshold": 500 }, ...]
  
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  proposedServices ProposedService[]

  @@map("service_masters")
}

/// 分析ルールマスタ
model AnalysisRuleMaster {
  id          String   @id @default(cuid())
  name        String   /// ルール名
  ruleType    String   /// ルールタイプ
  
  // 条件定義
  conditions  Json     /// { "metric": "totalSessions", "operator": "<", "value": 500 }
  
  // 出力定義
  issueType   String   /// 課題タイプ
  severity    String   /// 重要度（HIGH/MEDIUM/LOW）
  message     String   /// 課題メッセージテンプレート
  
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("analysis_rule_masters")
}
```

### 4.3 課題タイプ定義

| 課題タイプ | 説明 | 判定条件（例） | 提案サービス |
|-----------|------|--------------|-------------|
| LOW_TRAFFIC | 流入数が少ない | 月間セッション < 500 | 広告、ポスティング、SEO対策 |
| LOW_LOCAL_TRAFFIC | 地域からの流入が少ない | 地域流入率 < 30% | ローカルSEO、MEO対策 |
| LOW_REVIEW_COUNT | 口コミ数が少ない | 口コミ数 < 30件 | 口コミ促進サービス |
| LOW_REVIEW_SCORE | 口コミ評価が低い | 平均評価 < 3.5 | 評価改善コンサル |
| LOW_ENGAGEMENT | 滞在時間が短い | 平均滞在 < 60秒 | HP改善、コンテンツ制作 |
| AD_INEFFICIENCY | 広告効果が低い | 広告経由の直帰率 > 70% | 広告運用改善、LP制作 |
| COMPETITOR_REVIEW_GAP | 競合より口コミ数が少ない | 競合上位との差 > 50件 | 口コミ促進サービス |
| COMPETITOR_RATING_GAP | 競合より評価が低い | 競合平均より -0.5点以上 | 評価改善コンサル |
| LOW_AREA_RANKING | エリア内ランキングが低い | 口コミ数ランキング 下位50% | MEO対策、口コミ促進 |
| PATIENT_DECLINE | 新規患者数が減少 | 前月比 -20%以上 | 広告、キャンペーン施策 |
| COMPLAINT_IMBALANCE | 特定主訴に偏り | 1主訴が60%以上 | 他診療科目のPR強化 |
| HIGH_VALUE_DECLINE | 高単価主訴の減少 | 矯正・インプラント 前月比-30% | SNS広告、LP制作 |
| MEASURE_LOW_EFFECT | 施策効果が低い | ROI < 100% | 施策見直しコンサル |
| TRAFFIC_PATIENT_GAP | 流入多いが患者少ない | CVR < 1% | HP改善、導線最適化 |

---

## 5. 分析ロジック詳細

### 5.1 流入分析

```typescript
interface TrafficAnalysis {
  // 基本指標
  totalSessions: number;        // 総セッション
  sessionsTrend: number;        // 前月比（%）
  
  // 地域分析
  targetRegionRate: number;     // 医院地域からの流入率
  topRegions: { name: string; rate: number }[];
  
  // 判定結果
  issues: Issue[];
}

// 判定ロジック
function analyzeTraffic(data: AnalyticsData, clinic: DentalClinic): TrafficAnalysis {
  const issues: Issue[] = [];
  
  // 流入数チェック
  if (data.totalSessions < 500) {
    issues.push({
      type: 'LOW_TRAFFIC',
      severity: 'HIGH',
      message: `月間流入数が${data.totalSessions}件と少なめです。広告やSEO対策で集客強化が必要です。`
    });
  }
  
  // 地域流入チェック
  const localRate = calculateLocalRate(data.regionData, clinic.prefecture, clinic.city);
  if (localRate < 30) {
    issues.push({
      type: 'LOW_LOCAL_TRAFFIC',
      severity: 'HIGH',
      message: `地域（${clinic.city}）からの流入が${localRate}%と低く、全国向けSEOに偏っている可能性があります。`
    });
  }
  
  return { /* ... */ issues };
}
```

### 5.2 競合比較分析

```typescript
interface CompetitorAnalysis {
  // 自院データ
  ownReviewCount: number;
  ownRating: number;
  
  // 競合データ
  competitors: {
    name: string;
    reviewCount: number;
    rating: number;
    reviewGap: number;     // 口コミ数の差（正: 競合が多い）
    ratingGap: number;     // 評価の差（正: 競合が高い）
  }[];
  
  // エリアランキング
  areaRanking: {
    reviewCountRank: number;   // 口コミ数順位
    ratingRank: number;        // 評価順位
    totalClinics: number;      // エリア内医院総数
  };
  
  // 判定結果
  issues: Issue[];
}

// 競合比較ロジック
function analyzeCompetitors(
  ownReview: ReviewData,
  competitors: CompetitorWithReview[]
): CompetitorAnalysis {
  const issues: Issue[] = [];
  
  // 競合との口コミ数比較
  const avgCompetitorReviews = competitors.reduce(
    (sum, c) => sum + c.reviewData.totalReviews, 0
  ) / competitors.length;
  
  if (ownReview.totalReviews < avgCompetitorReviews * 0.7) {
    issues.push({
      type: 'COMPETITOR_REVIEW_GAP',
      severity: 'HIGH',
      message: `口コミ数が競合平均（${Math.round(avgCompetitorReviews)}件）より少ない状況です。比較検討時に不利になる可能性があります。`
    });
  }
  
  // 競合との評価比較
  const avgCompetitorRating = competitors.reduce(
    (sum, c) => sum + c.reviewData.averageRating, 0
  ) / competitors.length;
  
  if (ownReview.averageRating < avgCompetitorRating - 0.3) {
    issues.push({
      type: 'COMPETITOR_RATING_GAP',
      severity: 'MEDIUM',
      message: `評価が競合平均（${avgCompetitorRating.toFixed(1)}点）より低い状況です。`
    });
  }
  
  // エリア内ランキング計算
  const allClinics = [
    { name: '自院', reviews: ownReview.totalReviews, rating: ownReview.averageRating },
    ...competitors.map(c => ({
      name: c.name,
      reviews: c.reviewData.totalReviews,
      rating: c.reviewData.averageRating
    }))
  ];
  
  const sortedByReviews = [...allClinics].sort((a, b) => b.reviews - a.reviews);
  const reviewRank = sortedByReviews.findIndex(c => c.name === '自院') + 1;
  
  if (reviewRank > allClinics.length / 2) {
    issues.push({
      type: 'LOW_AREA_RANKING',
      severity: 'MEDIUM',
      message: `エリア内の口コミ数ランキングが${reviewRank}位/${allClinics.length}医院と下位です。`
    });
  }
  
  return { /* ... */ issues };
}
```

### 5.3 主訴別患者分析

```typescript
interface PatientAnalysis {
  // 全体データ
  totalNewPatients: number;
  momChange: number;           // 前月比（%）
  yoyChange: number;           // 前年同月比（%）
  
  // 主訴別データ
  byComplaint: {
    name: string;
    count: number;
    percentage: number;        // 全体に占める割合
    momChange: number;         // 前月比
    trend: 'up' | 'down' | 'stable';
  }[];
  
  // 判定結果
  issues: Issue[];
}

// 主訴別分析ロジック
function analyzePatientData(
  currentMonth: MonthlyPatientData,
  previousMonth: MonthlyPatientData | null,
  previousYear: MonthlyPatientData | null
): PatientAnalysis {
  const issues: Issue[] = [];
  
  // 全体の前月比チェック
  if (previousMonth) {
    const momChange = ((currentMonth.totalNewPatients - previousMonth.totalNewPatients) 
      / previousMonth.totalNewPatients) * 100;
    
    if (momChange < -20) {
      issues.push({
        type: 'PATIENT_DECLINE',
        severity: 'HIGH',
        message: `新規患者数が前月比${momChange.toFixed(0)}%と大幅に減少しています。`
      });
    }
  }
  
  // 主訴の偏りチェック
  const topComplaint = currentMonth.patientsByComplaint
    .sort((a, b) => b.patientCount - a.patientCount)[0];
  const topPercentage = (topComplaint.patientCount / currentMonth.totalNewPatients) * 100;
  
  if (topPercentage > 60) {
    issues.push({
      type: 'COMPLAINT_IMBALANCE',
      severity: 'MEDIUM',
      message: `「${topComplaint.chiefComplaint.name}」が全体の${topPercentage.toFixed(0)}%を占めており、特定主訴に偏っています。`
    });
  }
  
  // 高単価主訴（矯正・インプラント）の減少チェック
  const highValueComplaints = ['矯正歯科', 'インプラント'];
  for (const complaint of highValueComplaints) {
    const current = currentMonth.patientsByComplaint.find(c => c.chiefComplaint.name === complaint);
    const previous = previousMonth?.patientsByComplaint.find(c => c.chiefComplaint.name === complaint);
    
    if (current && previous && current.patientCount < previous.patientCount * 0.7) {
      issues.push({
        type: 'HIGH_VALUE_DECLINE',
        severity: 'HIGH',
        message: `高単価の「${complaint}」が前月比${((current.patientCount / previous.patientCount - 1) * 100).toFixed(0)}%と減少しています。`
      });
    }
  }
  
  return { /* ... */ issues };
}
```

### 5.4 施策効果分析

```typescript
interface MeasureEffectAnalysis {
  // 施策情報
  measureName: string;
  category: MeasureCategory;
  cost: number;
  period: { start: Date; end: Date };
  
  // 効果指標
  sessionChange: { before: number; after: number; changeRate: number };
  patientChange: { before: number; after: number; changeRate: number };
  targetComplaintChange: { complaint: string; before: number; after: number; changeRate: number }[];
  
  // ROI分析
  roi: number;
  costPerAcquisition: number;
  estimatedRevenue: number;
  
  // 評価
  overallEvaluation: 'excellent' | 'good' | 'moderate' | 'poor';
  issues: Issue[];
}

// 施策効果分析ロジック
function analyzeMeasureEffect(
  measure: Measure,
  beforeData: { analytics: AnalyticsData; patients: MonthlyPatientData },
  afterData: { analytics: AnalyticsData; patients: MonthlyPatientData }
): MeasureEffectAnalysis {
  const issues: Issue[] = [];
  
  // セッション変化
  const sessionChangeRate = ((afterData.analytics.totalSessions - beforeData.analytics.totalSessions) 
    / beforeData.analytics.totalSessions) * 100;
  
  // 患者数変化
  const patientChangeRate = ((afterData.patients.totalNewPatients - beforeData.patients.totalNewPatients) 
    / beforeData.patients.totalNewPatients) * 100;
  
  // 新規患者増加数
  const patientIncrease = afterData.patients.totalNewPatients - beforeData.patients.totalNewPatients;
  
  // 推定売上（患者1人あたり平均単価を仮定: 30,000円）
  const avgPatientValue = 30000;
  const estimatedRevenue = patientIncrease * avgPatientValue;
  
  // ROI計算
  const roi = measure.cost ? ((estimatedRevenue - measure.cost) / measure.cost) * 100 : 0;
  
  // 1患者獲得単価
  const costPerAcquisition = patientIncrease > 0 && measure.cost 
    ? measure.cost / patientIncrease 
    : 0;
  
  // ROIが低い場合の警告
  if (roi < 100) {
    issues.push({
      type: 'MEASURE_LOW_EFFECT',
      severity: 'MEDIUM',
      message: `施策「${measure.name}」のROIが${roi.toFixed(0)}%と低く、投資効果が十分ではありません。`
    });
  }
  
  // 流入は増えたが患者が増えていない場合
  if (sessionChangeRate > 30 && patientChangeRate < 10) {
    issues.push({
      type: 'TRAFFIC_PATIENT_GAP',
      severity: 'HIGH',
      message: `流入は${sessionChangeRate.toFixed(0)}%増加しましたが、新規患者は${patientChangeRate.toFixed(0)}%増にとどまっています。HP改善や導線の見直しが必要です。`
    });
  }
  
  // 総合評価
  let overallEvaluation: 'excellent' | 'good' | 'moderate' | 'poor';
  if (roi >= 300) overallEvaluation = 'excellent';
  else if (roi >= 150) overallEvaluation = 'good';
  else if (roi >= 100) overallEvaluation = 'moderate';
  else overallEvaluation = 'poor';
  
  return { /* ... */ overallEvaluation, issues };
}
```

### 5.5 AI総合分析プロンプト

```typescript
const analysisPrompt = `
あなたは歯科医院のマーケティング専門家です。
以下のデータを分析し、課題と具体的な改善提案を作成してください。

## 医院情報
- 医院名: ${clinic.name}
- 所在地: ${clinic.prefecture}${clinic.city}
- 診療科目: ${clinic.specialties.join(', ')}

## Google Analytics データ（${period}）
- 月間セッション: ${analytics.totalSessions}件
- 地域流入率: ${localRate}%（${clinic.city}からの流入）
- 平均滞在時間: ${formatDuration(analytics.avgSessionDuration)}
- 直帰率: ${analytics.bounceRate}%
- 広告経由セッション: ${analytics.paidSessions}件
- 広告経由の直帰率: ${analytics.paidBounceRate}%

## 口コミデータ
- 口コミ数: ${review.totalReviews}件
- 平均評価: ${review.averageRating}点

## 新規患者データ（${patientData.year}年${patientData.month}月）
- 新規患者合計: ${patientData.totalNewPatients}人（前月比: ${patientData.momChange}%）
- 主訴別内訳:
${patientData.byComplaint.map(c => 
  `  - ${c.name}: ${c.count}人（前月比: ${c.momChange}%）`
).join('\n')}

## 実施中の施策
${activeMeasures.map(m => 
  `- ${m.name}（${m.category}）: ${formatDate(m.startDate)}〜 費用: ¥${m.cost}`
).join('\n')}

## 過去施策の効果
${recentMeasureEffects.map(e => 
  `- ${e.measureName}: ROI ${e.roi}%, 新規患者 +${e.patientIncrease}人`
).join('\n')}

## 競合比較データ
- エリア内順位: 口コミ数 ${competitorAnalysis.areaRanking.reviewCountRank}位/${competitorAnalysis.areaRanking.totalClinics}医院
- 競合平均口コミ数: ${competitorAnalysis.avgCompetitorReviews}件
- 競合平均評価: ${competitorAnalysis.avgCompetitorRating}点
- 主な競合:
${competitorAnalysis.competitors.slice(0, 3).map(c => 
  `  - ${c.name}: ${c.reviewCount}件, ${c.rating}点`
).join('\n')}

## 検出された課題
${issues.map(i => `- ${i.message}`).join('\n')}

---

以下の形式で分析結果を出力してください：

### 現状分析
（データに基づいた客観的な現状説明。競合との比較、患者数トレンドも含める）

### 主な課題
（優先度順に課題を列挙。競合との差分、主訴別の傾向も考慮）

### 主訴別分析
（注力すべき主訴、伸びている主訴、減少傾向の主訴を分析）

### 施策効果評価
（実施中・過去の施策の効果を評価。ROIや患者獲得数の観点から）

### 推奨アクション
（具体的な改善施策を優先度付きで提案。過去の施策効果も踏まえて）

### 期待効果
（施策実施後の期待される効果。患者数増加の見込み、競合との差を埋める観点も含める）
`;
```

---

## 6. 画面遷移図

```
                                    ┌─────────────┐
                                    │   ログイン   │
                                    └──────┬──────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            ダッシュボード                                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ - 登録医院数サマリー  - 最近の分析  - 課題ありの医院  - お知らせ      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────┬──────────────────────┬────────────────────┬────────────────┘
              │                      │                    │
              ▼                      ▼                    ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  歯科医院一覧    │    │  メンバー管理    │    │    設定         │
    └────────┬────────┘    └─────────────────┘    └─────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐    ┌─────────────┐
│ 新規登録 │    │  医院詳細    │
└─────────┘    └──────┬──────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ 基本情報  │ │Google連携│ │ 分析実行  │
   │  編集    │ │  設定   │ │          │
   └──────────┘ └──────────┘ └────┬─────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ 分析ダッシュボード │
                         └────────┬────────┘
                                  │
         ┌──────────┬──────────┬──────────┬──┴───┬──────────┐
         ▼          ▼          ▼          ▼      ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │流入分析│ │口コミ  │ │競合比較│ │滞在時間│ │広告効果│ │分析履歴│
    │ 詳細  │ │ 詳細  │ │        │ │ 詳細  │ │ 詳細  │ │ 一覧  │
    └────────┘ └────────┘ └───┬────┘ └────────┘ └────────┘ └───┬────┘
                              │                                 │
                    ┌─────────┴─────────┐                  ┌────┴────┐
                    ▼                   ▼                  ▼         ▼
               ┌────────┐          ┌────────┐         ┌────────┐ ┌────────┐
               │競合設定│          │エリア内│         │履歴比較│ │PDF出力 │
               │        │          │ランキング│        └────────┘ └────────┘
               └────────┘          └────────┘
```

---

## 7. API設計（概要）

### 7.1 エンドポイント一覧

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/logout` | ログアウト |
| GET | `/api/clinics` | 歯科医院一覧 |
| POST | `/api/clinics` | 歯科医院登録 |
| GET | `/api/clinics/:id` | 歯科医院詳細 |
| PUT | `/api/clinics/:id` | 歯科医院更新 |
| DELETE | `/api/clinics/:id` | 歯科医院削除 |
| POST | `/api/clinics/:id/connect-google` | Google連携 |
| POST | `/api/clinics/:id/fetch-data` | データ取得実行 |
| POST | `/api/clinics/:id/analyze` | 分析実行 |
| GET | `/api/clinics/:id/analysis` | 分析結果取得 |
| GET | `/api/clinics/:id/analysis/history` | 分析履歴 |
| POST | `/api/clinics/:id/analysis/ai` | AI分析実行 |
| GET | `/api/clinics/:id/report/pdf` | PDFレポート生成 |
| GET | `/api/clinics/:id/competitors` | 競合医院一覧 |
| POST | `/api/clinics/:id/competitors` | 競合医院登録 |
| DELETE | `/api/clinics/:id/competitors/:competitorId` | 競合医院削除 |
| POST | `/api/clinics/:id/competitors/search` | 周辺競合医院検索 |
| POST | `/api/clinics/:id/competitors/fetch-reviews` | 競合口コミ取得 |
| GET | `/api/clinics/:id/competitors/comparison` | 競合比較データ取得 |
| GET | `/api/clinics/:id/competitors/ranking` | エリア内ランキング |
| GET | `/api/clinics/:id/patients` | 患者データ一覧 |
| POST | `/api/clinics/:id/patients` | 患者データ登録 |
| PUT | `/api/clinics/:id/patients/:yearMonth` | 患者データ更新 |
| GET | `/api/clinics/:id/patients/trend` | 主訴別トレンド取得 |
| GET | `/api/clinics/:id/patients/analysis` | 患者データ分析 |
| GET | `/api/clinics/:id/measures` | 施策一覧 |
| POST | `/api/clinics/:id/measures` | 施策登録 |
| PUT | `/api/clinics/:id/measures/:measureId` | 施策更新 |
| DELETE | `/api/clinics/:id/measures/:measureId` | 施策削除 |
| POST | `/api/clinics/:id/measures/:measureId/analyze` | 施策効果分析実行 |
| GET | `/api/clinics/:id/measures/:measureId/effect` | 施策効果取得 |
| GET | `/api/clinics/:id/measures/summary` | 施策効果サマリー |
| GET | `/api/masters/services` | サービスマスタ |
| GET | `/api/masters/rules` | 分析ルールマスタ |
| GET | `/api/masters/complaints` | 主訴マスタ |
| POST | `/api/masters/complaints` | 主訴マスタ登録 |
| GET | `/api/users` | ユーザー一覧 |
| POST | `/api/users/invite` | ユーザー招待 |

---

## 8. 非機能要件

### 8.1 セキュリティ
- OAuth 2.0 によるGoogle API認証
- JWT ベースのセッション管理
- APIトークンの暗号化保存
- HTTPS必須

### 8.2 パフォーマンス
- 分析ダッシュボードの表示: 3秒以内
- AI分析: 30秒以内
- データ取得: 1分以内

### 8.3 可用性
- 稼働率: 99.5%以上
- バックアップ: 日次

---

## 9. 開発フェーズ案

| フェーズ | 期間 | 内容 |
|---------|------|------|
| Phase 1 | 4週間 | 認証・組織管理、歯科医院CRUD、基本UI |
| Phase 2 | 4週間 | Google API連携、データ取得・保存 |
| Phase 3 | 3週間 | 分析ロジック実装、ダッシュボード |
| Phase 4 | 2週間 | 競合医院管理、競合比較分析機能 |
| Phase 5 | 3週間 | 新規患者データ入力、主訴別分析機能 |
| Phase 6 | 3週間 | 施策管理、施策効果分析機能 |
| Phase 7 | 3週間 | OpenRouter/Gemini AI分析連携、提案機能 |
| Phase 8 | 2週間 | PDF出力、履歴・比較機能 |
| Phase 9 | 2週間 | テスト・バグ修正・本番デプロイ |

**合計: 約26週間（6.5ヶ月）**

### 9.1 主訴マスタ初期データ

| 主訴名 | アイコン | 説明 |
|-------|---------|------|
| 虫歯治療 | 🦷 | 虫歯の治療、詰め物・被せ物 |
| 矯正歯科 | 😁 | 歯列矯正、マウスピース矯正 |
| インプラント | 🔩 | インプラント治療 |
| ホワイトニング | ✨ | 歯のホワイトニング |
| クリーニング・予防 | 🧹 | 定期クリーニング、予防歯科 |
| 歯周病治療 | 🏥 | 歯周病・歯肉炎の治療 |
| 小児歯科 | 👶 | 子供の歯科治療 |
| 緊急・痛み | 🆘 | 急な痛み、緊急対応 |
| 入れ歯・義歯 | 🦴 | 入れ歯の作成・調整 |
| 審美歯科 | 💎 | セラミック、ラミネートベニア |
| 根管治療 | 🔬 | 根管治療（神経の治療） |
| 親知らず | 🦷 | 親知らずの抜歯・相談 |
| その他 | 📋 | その他の相談・治療 |

