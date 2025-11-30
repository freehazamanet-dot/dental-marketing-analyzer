/**
 * OpenRouter経由でGemini AIを呼び出す
 * 総合分析・提案生成に使用
 */

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface AnalysisData {
  clinic: {
    name: string;
    prefecture: string;
    city: string;
    specialties: string[];
  };
  analytics?: {
    totalSessions: number;
    totalUsers: number;
    avgSessionDuration: number;
    bounceRate: number;
    localTrafficRate: number;
    paidSessions?: number;
    paidBounceRate?: number;
  };
  review?: {
    totalReviews: number;
    averageRating: number;
  };
  competitors?: {
    name: string;
    totalReviews: number;
    averageRating: number;
  }[];
  patientData?: {
    year: number;
    month: number;
    totalNewPatients: number;
    byComplaint: { name: string; count: number }[];
  };
  measures?: {
    name: string;
    category: string;
    cost: number;
    roi?: number;
  }[];
  issues: { type: string; severity: string; message: string }[];
}

interface ProposedService {
  name: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedCost: string;
  expectedEffect: string;
  reason: string;
  timeline?: string;
}

interface AIAnalysisResult {
  currentAnalysis: string;
  mainIssues: string[];
  competitorAnalysis?: string;
  webAnalysis?: string;
  reviewAnalysis?: string;
  complaintAnalysis?: string;
  measureEvaluation?: string;
  recommendations: string[];
  proposedServices: ProposedService[];
  expectedEffects: string;
}

/**
 * OpenRouter経由でGemini 3を呼び出す
 */
export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "DentalMarketing Analyzer",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * 総合分析プロンプトを生成
 */
function buildAnalysisPrompt(data: AnalysisData): string {
  // 業界平均値（歯科医院の目安）
  const benchmarks = {
    sessions: { poor: 500, average: 1500, good: 3000, excellent: 5000 },
    bounceRate: { excellent: 30, good: 45, average: 55, poor: 70 },
    avgDuration: { poor: 60, average: 120, good: 180, excellent: 300 },
    reviews: { poor: 10, average: 30, good: 50, excellent: 100 },
    rating: { poor: 3.0, average: 3.8, good: 4.2, excellent: 4.5 },
  };

  let prompt = `あなたは歯科医院マーケティングの専門家です。10年以上の実績を持ち、数百件の歯科医院の集客改善を手がけてきました。
以下のデータを多角的に分析し、具体的で実行可能な改善提案を作成してください。

## 分析対象医院
- 医院名: ${data.clinic.name}
- 所在地: ${data.clinic.prefecture}${data.clinic.city}
- 診療科目: ${data.clinic.specialties.join(", ") || "未設定"}

## 業界ベンチマーク（参考値）
- 月間セッション: 平均${benchmarks.sessions.average}件、優良${benchmarks.sessions.good}件以上
- 直帰率: 平均${benchmarks.bounceRate.average}%、優良${benchmarks.bounceRate.good}%以下
- 平均滞在時間: 平均${benchmarks.avgDuration.average / 60}分、優良${benchmarks.avgDuration.good / 60}分以上
- 口コミ数: 平均${benchmarks.reviews.average}件、優良${benchmarks.reviews.good}件以上
- 口コミ評価: 平均${benchmarks.rating.average}点、優良${benchmarks.rating.good}点以上
`;

  if (data.analytics) {
    const sessionLevel = data.analytics.totalSessions < benchmarks.sessions.poor ? "要改善" :
      data.analytics.totalSessions < benchmarks.sessions.average ? "平均以下" :
      data.analytics.totalSessions < benchmarks.sessions.good ? "平均的" : "良好";
    
    const bounceLevel = data.analytics.bounceRate > benchmarks.bounceRate.poor ? "要改善" :
      data.analytics.bounceRate > benchmarks.bounceRate.average ? "平均以下" :
      data.analytics.bounceRate > benchmarks.bounceRate.good ? "平均的" : "良好";
    
    const durationLevel = data.analytics.avgSessionDuration < benchmarks.avgDuration.poor ? "要改善" :
      data.analytics.avgSessionDuration < benchmarks.avgDuration.average ? "平均以下" :
      data.analytics.avgSessionDuration < benchmarks.avgDuration.good ? "平均的" : "良好";

    prompt += `
## Webサイト分析データ
| 指標 | 値 | 業界水準 | 評価 |
|------|-----|---------|------|
| 月間セッション | ${data.analytics.totalSessions}件 | 平均${benchmarks.sessions.average}件 | ${sessionLevel} |
| 月間ユーザー | ${data.analytics.totalUsers}人 | - | - |
| 地域流入率 | ${data.analytics.localTrafficRate}% | 60%以上が理想 | ${data.analytics.localTrafficRate >= 60 ? "良好" : "要改善"} |
| 平均滞在時間 | ${Math.floor(data.analytics.avgSessionDuration / 60)}分${Math.floor(data.analytics.avgSessionDuration % 60)}秒 | 平均${benchmarks.avgDuration.average / 60}分 | ${durationLevel} |
| 直帰率 | ${data.analytics.bounceRate}% | 平均${benchmarks.bounceRate.average}% | ${bounceLevel} |
${data.analytics.paidSessions ? `| 広告経由セッション | ${data.analytics.paidSessions}件 | - | - |` : ""}
${data.analytics.paidBounceRate ? `| 広告経由直帰率 | ${data.analytics.paidBounceRate}% | 50%以下が理想 | ${data.analytics.paidBounceRate <= 50 ? "良好" : "要改善"} |` : ""}

### Webサイト分析のポイント
- セッション数が${sessionLevel}のため、${sessionLevel === "要改善" || sessionLevel === "平均以下" ? "SEO対策や広告運用の強化が必要" : "現状維持しつつ質の向上を目指す"}
- 直帰率${data.analytics.bounceRate}%は${bounceLevel}。${bounceLevel === "要改善" || bounceLevel === "平均以下" ? "LPの改善やコンテンツの充実が急務" : "引き続き良質なコンテンツを提供"}
- 平均滞在時間${Math.floor(data.analytics.avgSessionDuration / 60)}分${Math.floor(data.analytics.avgSessionDuration % 60)}秒は${durationLevel}。${durationLevel === "要改善" || durationLevel === "平均以下" ? "ユーザーの興味を引くコンテンツが不足している可能性" : "情報提供は適切"}
`;
  } else {
    prompt += `
## Webサイト分析データ
※ Google Analyticsデータが未連携のため、Web集客の詳細分析ができません。
→ 改善提案: GA4を設定し、データに基づいた改善サイクルを構築することを強く推奨します。
`;
  }

  if (data.review) {
    const reviewLevel = data.review.totalReviews < benchmarks.reviews.poor ? "要改善" :
      data.review.totalReviews < benchmarks.reviews.average ? "平均以下" :
      data.review.totalReviews < benchmarks.reviews.good ? "平均的" : "良好";
    
    const ratingLevel = data.review.averageRating < benchmarks.rating.poor ? "要改善" :
      data.review.averageRating < benchmarks.rating.average ? "平均以下" :
      data.review.averageRating < benchmarks.rating.good ? "平均的" : "良好";

    prompt += `
## 口コミデータ
| 指標 | 値 | 業界水準 | 評価 |
|------|-----|---------|------|
| 口コミ数 | ${data.review.totalReviews}件 | 平均${benchmarks.reviews.average}件 | ${reviewLevel} |
| 平均評価 | ${data.review.averageRating}点 | 平均${benchmarks.rating.average}点 | ${ratingLevel} |

### 口コミ分析のポイント
- 口コミ数${data.review.totalReviews}件は${reviewLevel}。${reviewLevel === "要改善" || reviewLevel === "平均以下" ? "口コミ獲得施策が急務。来院時の声がけやフォローアップメールを検討" : "継続的に口コミを増やす取り組みを"}
- 評価${data.review.averageRating}点は${ratingLevel}。${ratingLevel === "要改善" || ratingLevel === "平均以下" ? "低評価の原因分析と改善が必要。待ち時間、説明の丁寧さ、痛みへの配慮を見直す" : "高評価を維持しつつ、さらなる向上を"}
`;
  } else {
    prompt += `
## 口コミデータ
※ Google Place IDが未設定のため、口コミデータが取得できていません。
→ 改善提案: Google Place IDを設定して口コミ分析を有効化することを推奨します。
   口コミは新規患者の来院決定に大きく影響します（約80%の患者が口コミを参考にしています）。
`;
  }

  if (data.competitors && data.competitors.length > 0) {
    const avgCompetitorRating = data.competitors.reduce((sum, c) => sum + c.averageRating, 0) / data.competitors.length;
    const avgCompetitorReviews = data.competitors.reduce((sum, c) => sum + c.totalReviews, 0) / data.competitors.length;
    
    prompt += `
## 競合比較データ
| 医院名 | 口コミ数 | 評価 | 自院との差（評価） |
|--------|---------|------|-------------------|
${data.competitors.map((c) => `| ${c.name} | ${c.totalReviews}件 | ${c.averageRating}点 | ${data.review ? (data.review.averageRating - c.averageRating > 0 ? "+" : "") + (data.review.averageRating - c.averageRating).toFixed(1) + "点" : "-"} |`).join("\n")}
| **競合平均** | **${Math.round(avgCompetitorReviews)}件** | **${avgCompetitorRating.toFixed(1)}点** | ${data.review ? (data.review.averageRating - avgCompetitorRating > 0 ? "+" : "") + (data.review.averageRating - avgCompetitorRating).toFixed(1) + "点" : "-"} |

### 競合分析のポイント
${data.review ? `
- 自院の評価${data.review.averageRating}点は競合平均${avgCompetitorRating.toFixed(1)}点と比較して${data.review.averageRating >= avgCompetitorRating ? "同等以上" : "下回っている"}
- 口コミ数${data.review.totalReviews}件は競合平均${Math.round(avgCompetitorReviews)}件と比較して${data.review.totalReviews >= avgCompetitorReviews ? "同等以上" : "下回っている"}
` : "- 口コミデータがないため競合との詳細比較ができません"}
`;
  }

  if (data.patientData) {
    const totalPatients = data.patientData.totalNewPatients;
    const topComplaints = [...data.patientData.byComplaint].sort((a, b) => b.count - a.count).slice(0, 3);
    
    prompt += `
## 新規患者データ（${data.patientData.year}年${data.patientData.month}月）
- 新規患者合計: ${totalPatients}人
- 主訴別内訳:
${data.patientData.byComplaint.map((c) => `  - ${c.name}: ${c.count}人（${((c.count / totalPatients) * 100).toFixed(1)}%）`).join("\n")}

### 患者データ分析のポイント
- 上位主訴: ${topComplaints.map(c => c.name).join("、")}
- ${topComplaints[0]?.name}が最多（${topComplaints[0]?.count}人、${((topComplaints[0]?.count / totalPatients) * 100).toFixed(1)}%）
- この主訴に対応した施策（LP作成、広告キーワード設定等）が効果的
`;
  }

  if (data.measures && data.measures.length > 0) {
    prompt += `
## 実施中の施策
${data.measures.map((m) => `- ${m.name}（${m.category}）: ¥${m.cost.toLocaleString()}/月${m.roi ? `、ROI: ${m.roi}%` : ""}`).join("\n")}

### 施策評価のポイント
${data.measures.map(m => `- ${m.name}: ${m.roi ? (m.roi > 100 ? "効果あり（継続推奨）" : m.roi > 0 ? "効果限定的（改善検討）" : "効果なし（見直し必要）") : "ROI未計測（効果測定を推奨）"}`).join("\n")}
`;
  }

  if (data.issues.length > 0) {
    prompt += `
## システム検出課題
${data.issues.map((i) => `- [${i.severity === "HIGH" ? "🔴重要" : i.severity === "MEDIUM" ? "🟡注意" : "🔵参考"}] ${i.message}`).join("\n")}
`;
  }

  prompt += `
---

## 分析タスク
上記データを基に、以下の観点から総合的に分析してください：

1. **現状の強み・弱み分析**: 数値データに基づいた客観的評価
2. **課題の優先順位付け**: 緊急度と影響度のマトリクスで整理
3. **競合との差別化ポイント**: 勝てる領域と改善すべき領域
4. **投資対効果の高い施策**: 限られた予算で最大効果を出す方法
5. **短期・中期のアクションプラン**: 今すぐ始めるべきこと、3ヶ月後に始めるべきこと

以下のJSON形式で出力してください：

{
  "currentAnalysis": "現状分析（400-500文字）：データに基づいた客観的な現状説明。強み・弱みを明確に。業界水準との比較を含める。",
  "mainIssues": [
    "【優先度1】最も緊急性の高い課題とその根拠（具体的な数値を含める）",
    "【優先度2】2番目に重要な課題とその根拠",
    "【優先度3】3番目に重要な課題とその根拠",
    "【優先度4】中期的に対応すべき課題",
    "【優先度5】長期的に検討すべき課題"
  ],
  "competitorAnalysis": "競合分析（200-300文字）：競合との比較結果、差別化ポイント、勝てる領域。競合データがない場合は一般的な競合環境を想定して記載。",
  "webAnalysis": "Web集客分析（200-300文字）：流入数、直帰率、滞在時間の評価と改善方向性。データがない場合は改善の重要性を記載。",
  "reviewAnalysis": "口コミ分析（200-300文字）：口コミの量と質の評価、改善方向性。データがない場合は口コミ獲得の重要性を記載。",
  "complaintAnalysis": "主訴別分析（150-200文字）：注力すべき主訴、マーケティング施策への活用方法。患者データがない場合はnull。",
  "measureEvaluation": "施策効果評価（150-200文字）：実施中施策の効果評価と改善提案。施策データがない場合はnull。",
  "recommendations": [
    "【今すぐ実施】1週間以内に始めるべき施策（具体的なアクション）",
    "【1ヶ月以内】準備期間が必要な施策",
    "【3ヶ月以内】中期的に取り組む施策",
    "【継続的】定期的に行うべき施策",
    "【検討事項】状況に応じて検討する施策"
  ],
  "proposedServices": [
    {
      "name": "サービス名",
      "description": "具体的な内容（80文字程度）",
      "priority": "HIGH/MEDIUM/LOW",
      "estimatedCost": "月額○○円〜○○円",
      "expectedEffect": "期待効果（例：新規患者+○人/月、口コミ+○件/月）",
      "reason": "提案理由（データに基づく根拠）",
      "timeline": "実施期間の目安"
    }
  ],
  "expectedEffects": "施策実施後の期待効果（200-250文字）：3ヶ月後、6ヶ月後の具体的な目標数値を含める"
}

proposedServicesは以下のサービスから課題に応じて3-5個提案してください：
- リスティング広告（Google/Yahoo）
- MEO対策（Googleビジネスプロフィール最適化）
- HP改善（デザイン・導線・コンテンツ）
- 口コミ促進施策
- ポスティング
- SEO対策
- LP作成（主訴別）
- SNS運用
- 動画制作
- チラシ・パンフレット制作

JSONのみを出力してください。`;

  return prompt;
}

/**
 * 歯科医院の総合分析を実行
 */
export async function analyzeClinic(
  data: AnalysisData
): Promise<AIAnalysisResult> {
  const prompt = buildAnalysisPrompt(data);
  const response = await callGemini(prompt);

  try {
    // JSONを抽出（マークダウンのコードブロックを考慮）
    let jsonStr = response;
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const result = JSON.parse(jsonStr.trim());
    
    // mainIssuesが文字列の場合は配列に変換
    let mainIssues = result.mainIssues || [];
    if (typeof mainIssues === "string") {
      mainIssues = mainIssues.split(/\n|・|●|•/).filter((s: string) => s.trim());
    }
    
    // recommendationsが文字列の場合は配列に変換
    let recommendations = result.recommendations || [];
    if (typeof recommendations === "string") {
      recommendations = recommendations.split(/\n|・|●|•/).filter((s: string) => s.trim());
    }

    return {
      currentAnalysis: result.currentAnalysis || "",
      mainIssues,
      competitorAnalysis: result.competitorAnalysis || undefined,
      webAnalysis: result.webAnalysis || undefined,
      reviewAnalysis: result.reviewAnalysis || undefined,
      complaintAnalysis: result.complaintAnalysis || undefined,
      measureEvaluation: result.measureEvaluation || undefined,
      recommendations,
      proposedServices: result.proposedServices || [],
      expectedEffects: result.expectedEffects || "",
    };
  } catch {
    // JSONパースに失敗した場合は生のテキストを返す
    return {
      currentAnalysis: response,
      mainIssues: [],
      recommendations: [],
      proposedServices: [],
      expectedEffects: "",
    };
  }
}

/**
 * 施策効果分析を実行
 */
export async function analyzeMeasureEffect(
  measureName: string,
  category: string,
  cost: number,
  beforeData: { sessions: number; patients: number; reviews: number },
  afterData: { sessions: number; patients: number; reviews: number }
): Promise<string> {
  const prompt = `あなたは歯科医院のマーケティング専門家です。
以下の施策効果データを分析し、評価と今後のアドバイスを提供してください。

## 施策情報
- 施策名: ${measureName}
- カテゴリ: ${category}
- 費用: ¥${cost.toLocaleString()}

## 施策前データ（1ヶ月）
- セッション数: ${beforeData.sessions}
- 新規患者数: ${beforeData.patients}人
- 口コミ数: ${beforeData.reviews}件

## 施策後データ（1ヶ月）
- セッション数: ${afterData.sessions}（${((afterData.sessions / beforeData.sessions - 1) * 100).toFixed(1)}%変化）
- 新規患者数: ${afterData.patients}人（${((afterData.patients / beforeData.patients - 1) * 100).toFixed(1)}%変化）
- 口コミ数: ${afterData.reviews}件（${((afterData.reviews / beforeData.reviews - 1) * 100).toFixed(1)}%変化）

## ROI計算
- 新規患者増加: ${afterData.patients - beforeData.patients}人
- 推定売上増加: ¥${((afterData.patients - beforeData.patients) * 30000).toLocaleString()}（患者単価3万円と仮定）
- ROI: ${(((afterData.patients - beforeData.patients) * 30000 - cost) / cost * 100).toFixed(1)}%

---

以下の観点で分析してください：
1. 効果サマリー（100文字程度）
2. 成功要因または改善点
3. 今後の推奨アクション

簡潔に300文字程度でまとめてください。`;

  return callGemini(prompt);
}

